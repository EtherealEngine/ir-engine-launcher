import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'

import { Channels } from '../../constants/Channels'
import Commands from '../../constants/Commands'
import Storage from '../../constants/Storage'
import SysRequirements from '../../constants/SysRequirements'
import {
  AppModel,
  AppStatus,
  DefaultAppsStatus,
  DefaultClusterStatus,
  DefaultSystemStatus
} from '../../models/AppStatus'
import {
  appConfigsPath,
  assetsPath,
  exec,
  execStream,
  fileExists,
  IBaseHandler,
  isValidUrl,
  scriptsPath
} from './IBaseHandler'
import { ensureEngineConfigs, ensureRippleConfigs, ensureVariables } from './SettingsHandler'

class ShellHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Shell.CheckMinikubeConfig, async (_event: IpcMainInvokeEvent, appsStatus: AppModel[]) => {
      try {
        await checkSystemStatus(window)

        const mandatoryConfigured = await checkAppStatus(window, appsStatus)

        await checkClusterStatus(window, mandatoryConfigured)
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category: 'check minikube config',
          message: JSON.stringify(err)
        })
      }
    }),
      ipcMain.handle(
        Channels.Shell.CheckMinikubeAppConfig,
        async (_event: IpcMainInvokeEvent, appsStatus: AppModel[]) => {
          try {
            await checkAppStatus(window, appsStatus)
          } catch (err) {
            window.webContents.send(Channels.Utilities.Log, {
              category: 'check minikube config',
              message: JSON.stringify(err)
            })
          }
        }
      ),
      ipcMain.handle(Channels.Shell.CheckSudoPassword, async (_event: IpcMainInvokeEvent, password: string = '') => {
        try {
          const validPassword = await checkSudoPassword(password)
          if (validPassword === false) {
            throw password ? 'Invalid password.' : 'Not logged in.'
          }

          return true
        } catch (err) {
          return false
        }
      }),
      ipcMain.handle(
        Channels.Shell.ConfigureMinikubeConfig,
        async (
          _event: IpcMainInvokeEvent,
          password: string,
          configs: Record<string, string>,
          vars: Record<string, string>,
          flags: Record<string, string>
        ) => {
          const category = 'configure minikube'
          try {
            await ensureVariables(configs[Storage.XRENGINE_PATH], vars)

            const configsFolder = path.resolve(appConfigsPath())
            const configsFolderExists = await fileExists(configsFolder)
            if (configsFolderExists === false) {
              await fs.mkdir(configsFolder, { recursive: true })
            }

            await ensureEngineConfigs(configs[Storage.XRENGINE_PATH], vars)
            await ensureRippleConfigs(configs[Storage.XRENGINE_PATH], configs[Storage.ENABLE_RIPPLE_STACK])

            const scriptsFolder = scriptsPath()
            const assetsFolder = assetsPath()
            const configureScript = path.join(scriptsFolder, 'configure-minikube.sh')
            log.info(`Executing script ${configureScript}`)

            const onConfigureStd = (data: any) => {
              window.webContents.send(Channels.Utilities.Log, { category, message: data })
            }
            const code = await execStream(
              `bash "${configureScript}" -a "${assetsFolder}" -c "${configsFolder}" -d "${
                flags[Storage.FORCE_DB_REFRESH]
              }" -f "${configs[Storage.XRENGINE_PATH]}" -p "${password}" -r "${configs[Storage.ENABLE_RIPPLE_STACK]}"`,
              onConfigureStd,
              onConfigureStd
            )
            if (code !== 0) {
              throw `Failed with error code ${code}.`
            }
            
            const fileServerScript = path.join(scriptsFolder, 'configure-file-server.sh')

            const onFileServerStd = (data: any) => {
              window.webContents.send(Channels.Utilities.Log, { category: 'file server', message: data })
            }
            execStream(
              `bash "${fileServerScript}" -f "${configs[Storage.XRENGINE_PATH]}"`,
              onFileServerStd,
              onFileServerStd
            )

            return true
          } catch (err) {
            log.error('Error in ConfigureMinikubeConfig.', err)
            window.webContents.send(Channels.Utilities.Log, {
              category,
              message: JSON.stringify(err)
            })
            return false
          }
        }
      ),
      ipcMain.handle(Channels.Shell.ConfigureMinikubeDashboard, async (_event: IpcMainInvokeEvent) => {
        const category = 'minikube dashboard'
        try {
          const onStdout = (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
            if (isValidUrl(data)) {
              window.webContents.send(Channels.Shell.ConfigureMinikubeDashboardResponse, data)
            }
          }
          const onStderr = (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
            if (stringData.toString().startsWith('*') === false) {
              window.webContents.send(Channels.Shell.ConfigureMinikubeDashboardError, data)
            }
          }
          await execStream(Commands.MINIKUBE_DASHBOARD, onStdout, onStderr)
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          return err
        }
      }),
      ipcMain.handle(Channels.Shell.ConfigureIPFSDashboard, async (_event: IpcMainInvokeEvent) => {
        const category = 'ipfs dashboard'
        try {
          const onStdout = (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            if (stringData.toString().startsWith('Handling connection')) {
              window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
            }

            if (stringData.toString().startsWith('Forwarding from 127.0.0.1')) {
              let url = stringData.toString().replace('Forwarding from ', '')
              url = url.split(' ')[0]
              url = `http://${url}/webui`
              window.webContents.send(Channels.Shell.ConfigureIPFSDashboardResponse, url)
            }
          }
          const onStderr = (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
            window.webContents.send(Channels.Shell.ConfigureIPFSDashboardError, data)
          }
          await execStream(
            `podname=$(kubectl get pods -l app.kubernetes.io/instance=local-ipfs --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl port-forward $podname :9095;`,
            onStdout,
            onStderr
          )
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          return err
        }
      }),
      ipcMain.handle(Channels.Shell.ExecuteRippledCommand, async (_event: IpcMainInvokeEvent, command: string) => {
        const category = 'rippled cli'
        try {
          const response = await exec(
            `podname=$(kubectl get pods -l app.kubernetes.io/instance=local-rippled --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl exec -i $podname -- bash -c "${command}";`
          )
          const { stdout, stderr } = response

          let output = ''
          if (stderr) {
            log.error('Error in ExecuteRippledCommand', stderr)
            output = stderr.toString()
          }

          if (stdout) {
            output += stdout.toString()
          }

          return output
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          throw err
        }
      }),
      ipcMain.handle(Channels.Shell.ExecuteCommand, async (_event: IpcMainInvokeEvent, command: string) => {
        const category = 'execute command'
        try {
          const output = await new Promise((resolve) => {
            execStream(
              command,
              (data: any) => {
                const stringData = typeof data === 'string' ? data.trim() : data
                window.webContents.send(Channels.Utilities.Log, {
                  category,
                  message: stringData
                })

                resolve(stringData)
              },
              (data: any) => {
                const stringData = typeof data === 'string' ? data.trim() : data
                window.webContents.send(Channels.Utilities.Log, {
                  category,
                  message: stringData
                })
              }
            )
          })

          return output
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          throw err
        }
      })
  }
}

const checkSystemStatus = async (window: BrowserWindow) => {
  for (const app of DefaultSystemStatus) {
    let status: AppModel = {
      ...app
    }

    if (status.id === 'os') {
      const type = os.type()
      status = {
        ...app,
        detail: type,
        status: SysRequirements.SUPPORTED_OSES.includes(type) ? AppStatus.Configured : AppStatus.NotConfigured
      }
    } else if (status.id === 'cpu') {
      const cpus = os.cpus()
      status = {
        ...app,
        detail: `${cpus.length.toString()} core(s)`,
        status: cpus.length < SysRequirements.MIN_CPU ? AppStatus.NotConfigured : AppStatus.Configured
      }
    } else if (status.id === 'memory') {
      let memory = os.totalmem() / (1024 * 1024)
      status = {
        ...app,
        detail: `${memory.toString()} MB`,
        status: memory < SysRequirements.MIN_MEMORY ? AppStatus.NotConfigured : AppStatus.Configured
      }
    }

    window.webContents.send(Channels.Utilities.Log, { category: status.name, message: status.detail })
    window.webContents.send(Channels.Shell.CheckSystemStatusResult, status)
  }
}

const checkAppStatus = async (window: BrowserWindow, appsStatus: AppModel[]) => {
  let mandatoryConfigured = true
  for (const app of appsStatus) {
    let status: AppModel = {
      ...app
    }

    if (app.checkCommand) {
      const response = await exec(app.checkCommand)
      const { stdout, stderr } = response

      if (stdout) {
        window.webContents.send(Channels.Utilities.Log, {
          category: status.name,
          message: typeof stdout === 'string' ? stdout.trim() : stdout
        })
      }
      if (stderr) {
        window.webContents.send(Channels.Utilities.Log, {
          category: status.name,
          message: typeof stderr === 'string' ? stderr.trim() : stderr
        })

        const mandatoryApp = DefaultAppsStatus.find((item) => item.id === app.id)
        if (mandatoryApp) {
          mandatoryConfigured = false
        }
      }

      status = {
        ...app,
        detail: stderr ? stderr : stdout,
        status: stderr ? AppStatus.NotConfigured : AppStatus.Configured
      }
    }

    window.webContents.send(Channels.Shell.CheckAppStatusResult, status)
  }

  return mandatoryConfigured
}

const checkClusterStatus = async (window: BrowserWindow, mandatoryConfigured: boolean) => {
  for (const clusterItem of DefaultClusterStatus) {
    let status: AppModel = {
      ...clusterItem
    }

    if (mandatoryConfigured == false) {
      status = {
        ...clusterItem,
        detail: 'XREngine required apps not configured',
        status: AppStatus.NotConfigured
      }
    } else if (clusterItem.checkCommand) {
      const response = await exec(clusterItem.checkCommand)
      const { stdout, stderr } = response

      if (stdout) {
        window.webContents.send(Channels.Utilities.Log, {
          category: clusterItem.name,
          message: typeof stdout === 'string' ? stdout.trim() : stdout
        })
      }
      if (stderr) {
        window.webContents.send(Channels.Utilities.Log, {
          category: clusterItem.name,
          message: typeof stderr === 'string' ? stderr.trim() : stderr
        })
      }

      let detail: string | Buffer = `Ready Instances: ${stdout === '' || stdout === undefined ? 0 : stdout}`
      let itemStatus = AppStatus.Configured

      if (stderr) {
        detail = stderr
        itemStatus = AppStatus.NotConfigured
      } else if (!stdout || parseInt(stdout.toString()) < 1) {
        itemStatus = AppStatus.NotConfigured
      }

      status = {
        ...clusterItem,
        detail,
        status: itemStatus
      }
    }

    window.webContents.send(Channels.Shell.CheckClusterStatusResult, status)
  }
}

const checkSudoPassword = async (password: string) => {
  const loginScript = path.join(scriptsPath(), 'sudo-login.sh')
  log.info(`Executing script ${loginScript}`)

  const response = await exec(`bash "${loginScript}" ${password}`)
  const { error } = response

  if (!error) {
    return true
  }

  log.error('Error while executing script ${loginScript}.', error)

  return false
}

export default ShellHandler
