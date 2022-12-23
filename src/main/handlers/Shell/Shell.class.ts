import { app, BrowserWindow } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import path from 'path'
import { kill } from 'ps-node'

import { Channels } from '../../../constants/Channels'
import Commands from '../../../constants/Commands'
import Storage from '../../../constants/Storage'
import {
  AppModel
} from '../../../models/AppStatus'
import {
  appConfigsPath,
  assetsPath,
  exec,
  execStream,
  fileExists,
  isValidUrl,
  scriptsPath
} from '../IBaseHandler'
import { ensureEngineConfigs, ensureRippleConfigs, ensureVariables } from '../Settings/Settings-helper'
import { checkAppStatus, checkClusterStatus, checkSudoPassword, checkSystemStatus, getProcessList } from './Shell-helper'

class Shell {
  static checkMinikubeConfig = async (appsStatus: AppModel[], window: BrowserWindow) => {
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
  }
  
  static checkMinikubeAppConfig =
    async (appsStatus: AppModel[], window: BrowserWindow) => {
      try {
        await checkAppStatus(window, appsStatus)
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category: 'check minikube config',
          message: JSON.stringify(err)
        })
      }
    }

  static checkSudoPassword = async (password: string = '') => {
    try {
      const validPassword = await checkSudoPassword(password)
      if (validPassword === false) {
        throw password ? 'Invalid password.' : 'Not logged in.'
      }

      return true
    } catch (err) {
      return false
    }
  }

  static configureMinikubeConfig =
    async (
      password: string,
      configs: Record<string, string>,
      vars: Record<string, string>,
      flags: Record<string, string>,
      window: BrowserWindow
    ) => {
      const category = 'configure minikube'
      try {
        await ensureVariables(configs[Storage.ENGINE_PATH], vars)

        const configsFolder = path.resolve(appConfigsPath())
        const configsFolderExists = await fileExists(configsFolder)
        if (configsFolderExists === false) {
          await fs.mkdir(configsFolder, { recursive: true })
        }

        await ensureEngineConfigs(configs[Storage.ENGINE_PATH], vars)
        await ensureRippleConfigs(configs[Storage.ENGINE_PATH], configs[Storage.ENABLE_RIPPLE_STACK])

        const scriptsFolder = scriptsPath()
        const assetsFolder = assetsPath()
        const configureScript = path.join(scriptsFolder, 'configure-minikube.sh')
        log.info(`Executing script ${configureScript}`)

        const onConfigureStd = (data: any) => {
          window.webContents.send(Channels.Utilities.Log, { category, message: data })
        }
        const code = await execStream(
          `bash "${configureScript}" -a "${assetsFolder}" -c "${configsFolder}" -d "${flags[Storage.FORCE_DB_REFRESH]
          }" -f "${configs[Storage.ENGINE_PATH]}" -p "${password}" -r "${configs[Storage.ENABLE_RIPPLE_STACK]}"`,
          onConfigureStd,
          onConfigureStd
        )
        if (code !== 0) {
          throw `Failed with error code ${code}.`
        }

        // Below block of code is to ensure file server is stopped when app is closed.
        const existingServer = await getProcessList('http-server')
        if (existingServer && existingServer.length === 0) {
          app.on('before-quit', async (e) => {
            try {
              e.preventDefault()

              const existingServers = await getProcessList('http-server')
              existingServers.forEach((httpProcess) => {
                kill(httpProcess.pid)
              })
            } catch { }

            app.quit()
            process.exit()
          })
        }

        const fileServerScript = path.join(scriptsFolder, 'configure-file-server.sh')

        const onFileServerStd = (data: any) => {
          try {
            window.webContents.send(Channels.Utilities.Log, { category: 'file server', message: data })
          } catch { }
        }

        execStream(
          `bash "${fileServerScript}" -f "${configs[Storage.ENGINE_PATH]}"`,
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

  static configureMinikubeDashboard = async (window: BrowserWindow) => {
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
  }

  static configureIPFSDashboard = async (window: BrowserWindow) => {
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
  }

  static executeRippledCommand = async (command: string, window: BrowserWindow) => {
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
  }

  static executeCommand = async (command: string, window: BrowserWindow) => {
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
  }
}

export default Shell
