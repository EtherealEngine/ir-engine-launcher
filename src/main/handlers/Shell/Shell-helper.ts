import { BrowserWindow } from 'electron'
import log from 'electron-log'
import os from 'os'
import path from 'path'
import { lookup, Program } from 'ps-node'

import { Channels } from '../../../constants/Channels'
import SysRequirements from '../../../constants/SysRequirements'
import {
  AppModel,
  AppStatus,
  DefaultAppsStatus,
  DefaultClusterStatus,
  DefaultSystemStatus
} from '../../../models/AppStatus'
import {
  exec,
  scriptsPath
} from '../IBaseHandler'

export const getProcessList = (command: string) => {
  return new Promise<Program[]>((resolve, reject) => {
    lookup(
      {
        command
      },
      (err, resultList) => {
        if (err) {
          reject(err)
        } else {
          resolve(resultList)
        }
      }
    )
  })
}

export const checkSystemStatus = async (window: BrowserWindow) => {
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

export const checkAppStatus = async (window: BrowserWindow, appsStatus: AppModel[]) => {
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

export const checkClusterStatus = async (window: BrowserWindow, mandatoryConfigured: boolean) => {
  for (const clusterItem of DefaultClusterStatus) {
    let status: AppModel = {
      ...clusterItem
    }

    if (mandatoryConfigured == false) {
      status = {
        ...clusterItem,
        detail: 'Ethereal Engine required apps not configured',
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

export const checkSudoPassword = async (password: string) => {
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
