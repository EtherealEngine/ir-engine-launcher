import crypto from 'crypto'
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'

import { Channels } from '../../constants/Channels'
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
import { ensureEngineConfigs, ensureRippleConfigs } from './SettingsHandler'

class ShellHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Shell.CheckMinikubeConfig, async (_event: IpcMainInvokeEvent) => {
      try {
        await checkSystemStatus(window)

        const allConfigured = await checkAppStatus(window)

        await checkClusterStatus(window, allConfigured)
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category: 'check minikube config',
          message: JSON.stringify(err)
        })
      }
    }),
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
            // Ensure auth field has value
            if (!vars[Storage.AUTH_SECRET_KEY]) {
              // https://stackoverflow.com/a/40191779/2077741
              vars[Storage.AUTH_SECRET_KEY] = crypto.randomBytes(16).toString('hex')
            }

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

            const onStd = (data: any) => {
              window.webContents.send(Channels.Utilities.Log, { category, message: data })
            }
            const code = await execStream(
              `bash "${configureScript}" -a "${assetsFolder}" -c "${configsFolder}" -d "${
                flags[Storage.FORCE_DB_REFRESH]
              }" -f "${configs[Storage.XRENGINE_PATH]}" -p "${password}" -r "${flags[Storage.ENABLE_RIPPLE_STACK]}"`,
              onStd,
              onStd
            )
            if (code !== 0) {
              throw `Failed with error code ${code}.`
            }

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
          await execStream(`minikube dashboard --url`, onStdout, onStderr)
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          return err
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

const checkAppStatus = async (window: BrowserWindow) => {
  let allConfigured = true
  for (const app of DefaultAppsStatus) {
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
        allConfigured = false
      }

      status = {
        ...app,
        detail: stderr ? stderr : stdout,
        status: stderr ? AppStatus.NotConfigured : AppStatus.Configured
      }
    }

    window.webContents.send(Channels.Shell.CheckAppStatusResult, status)
  }
  return allConfigured
}

const checkClusterStatus = async (window: BrowserWindow, allConfigured: boolean) => {
  for (const clusterItem of DefaultClusterStatus) {
    let status: AppModel = {
      ...clusterItem
    }

    if (allConfigured == false) {
      status = {
        ...clusterItem,
        detail: 'Apps not configured',
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
