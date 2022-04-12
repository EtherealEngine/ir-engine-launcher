import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log'
import os from 'os'
import path from 'path'

import { Channels } from '../../constants/Channels'
import SysRequirements from '../../constants/SysRequirements'
import {
  AppModel,
  AppStatus,
  DefaultAppsStatus,
  DefaultClusterStatus,
  DefaultSystemStatus
} from '../../models/AppStatus'
import { exec, execStream, IBaseHandler, isValidUrl, scriptsPath } from './IBaseHandler'

class ShellHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Shell.CheckMinikubeConfig, async (_event: IpcMainInvokeEvent) => {
      try {
        await checkSystemStatus(window)

        await checkAppStatus(window)

        await checkClusterStatus(window)
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
      ipcMain.handle(Channels.Shell.ConfigureMinikubeConfig, async (_event: IpcMainInvokeEvent) => {
        const category = 'configure minikube'
        try {
          const validPassword = await checkSudoPassword('')
          if (validPassword === false) {
            throw 'Invalid password.'
          }

          // const configureScript = path.join(scriptsPath(), 'configure-minikube.sh')
          // log.info(`Executing script ${configureScript}`)

          // const onStd = (data: any) => {
          //   window.webContents.send(Channels.Utilities.Log, { category, message: data })
          // }
          // const response = await execStream(`bash ${configureScript}`, onStd, onStd)
          // window.webContents.send(Channels.Utilities.Log, { category, message: response })

          return true
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          return false
        }
      }),
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
      }

      status = {
        ...app,
        detail: stderr ? stderr : stdout,
        status: stderr ? AppStatus.NotConfigured : AppStatus.Configured
      }
    }

    window.webContents.send(Channels.Shell.CheckAppStatusResult, status)
  }
}

const checkClusterStatus = async (window: BrowserWindow) => {
  for (const clusterItem of DefaultClusterStatus) {
    let status: AppModel = {
      ...clusterItem
    }

    if (clusterItem.checkCommand) {
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

  const response = await exec(`bash ${loginScript} ${password}`)
  const { error } = response

  if (!error) {
    return true
  }

  return false
}

export default ShellHandler
