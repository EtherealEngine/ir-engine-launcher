import childProcess, { ExecException } from 'child_process'
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import os from 'os'
// import log from 'electron-log'
import path from 'path'
import sudo from 'sudo-prompt'

import { Channels } from '../../constants/Channels'
import SysRequirements from '../../constants/SysRequirements'
import {
  AppModel,
  AppStatus,
  DefaultAppsStatus,
  DefaultClusterStatus,
  DefaultSystemStatus
} from '../../models/AppStatus'
import { IBaseHandler } from './IBaseHandler'

class ShellHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Shell.CheckMinikubeConfig, async (_event: IpcMainInvokeEvent, sudoMode: boolean) => {
      try {
        await checkSystemStatus(window)

        await checkAppStatus(window, sudoMode)

        await checkClusterStatus(window, sudoMode)
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category: 'check minikube config',
          message: JSON.stringify(err)
        })
      }
    }),
      ipcMain.handle(Channels.Shell.ConfigureMinikubeConfig, async (_event: IpcMainInvokeEvent) => {
        try {
          const script = path.join(__dirname, '../../../assets', 'scripts', 'configure-minikube.sh')

          const onStd = (data: any) => {
            window.webContents.send(Channels.Utilities.Log, { category: 'configure minikube', message: data })
          }
          const response = await shellExecStream(`sh ${script}`, onStd, onStd)
          window.webContents.send(Channels.Utilities.Log, { category: 'configure minikube', message: response })

          return true
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category: 'configure minikube',
            message: JSON.stringify(err)
          })
          return false
        }
      }),
      ipcMain.handle(Channels.Shell.ConfigureMinikubeDashboard, async (_event: IpcMainInvokeEvent) => {
        try {
          const onStdout = (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, { category: 'minikube dashboard', message: stringData })
            if (isValidUrl(data)) {
              window.webContents.send(Channels.Shell.ConfigureMinikubeDashboardResponse, data)
            }
          }
          const onStderr = (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, { category: 'minikube dashboard', message: stringData })
            if (stringData.toString().startsWith('*') === false) {
              window.webContents.send(Channels.Shell.ConfigureMinikubeDashboardError, data)
            }
          }
          await shellExecStream(`minikube dashboard --url`, onStdout, onStderr)
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category: 'minikube dashboard',
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

const checkAppStatus = async (window: BrowserWindow, sudoMode: boolean) => {
  for (const app of DefaultAppsStatus) {
    let status: AppModel = {
      ...app
    }

    if (app.checkCommand) {
      const response = await exec(app.checkCommand, sudoMode)
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

const checkClusterStatus = async (window: BrowserWindow, sudoMode: boolean) => {
  for (const clusterItem of DefaultClusterStatus) {
    let status: AppModel = {
      ...clusterItem
    }

    if (clusterItem.checkCommand) {
      const response = await exec(clusterItem.checkCommand, sudoMode)
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

const sudoShellExec = (command: string): Promise<ShellResponse> => {
  return new Promise((resolve) => {
    sudo.exec(
      command,
      {
        name: 'XREngine Control Center'
      },
      (error, stdout, stderr) => resolve({ error, stdout, stderr })
    )
  })
}

const shellExec = (command: string): Promise<ShellResponse> => {
  return new Promise((resolve) => {
    childProcess.exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => resolve({ error, stdout, stderr }))
  })
}

const shellExecStream = (
  command: string,
  onStdout: (data: any) => void,
  onStderr: (data: any) => void
): Promise<number | null> => {
  return new Promise((resolve) => {
    const process = childProcess.exec(command)
    process.stdout?.on('data', (data) => {
      onStdout(data)
    })
    process.stderr?.on('data', (data) => {
      onStderr(data)
    })
    process.on('close', (code) => {
      resolve(code)
    })
  })
}

export const exec = async (command: string, isSudo = false): Promise<ShellResponse> => {
  if (isSudo) {
    return await sudoShellExec(command)
  }

  return await shellExec(command)
}

/**
 * https://stackoverflow.com/a/43467144/2077741
 * @param urlString
 * @returns
 */
const isValidUrl = (urlString: string) => {
  let url

  try {
    url = new URL(urlString)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

type ShellResponse = {
  error: ExecException | Error | null | undefined
  stdout: string | Buffer | undefined
  stderr: string | Buffer | undefined
}

export default ShellHandler
