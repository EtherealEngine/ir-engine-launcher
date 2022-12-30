import { BrowserWindow } from 'electron'
import { exec } from 'main/managers/ShellManager'
import os from 'os'
import { lookup, Program } from 'ps-node'

import { Channels } from '../../../constants/Channels'
import SysRequirements from '../../../constants/SysRequirements'
import {
  AppModel,
  AppStatus,
  DefaultAppsStatus,
  DefaultEngineStatus,
  DefaultSystemStatus
} from '../../../models/AppStatus'

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
    window.webContents.send(Channels.Cluster.CheckSystemStatusResult, status)
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

    window.webContents.send(Channels.Cluster.CheckAppStatusResult, status)
  }

  return mandatoryConfigured
}

export const checkEngineStatus = async (window: BrowserWindow, mandatoryConfigured: boolean) => {
  for (const engineItem of DefaultEngineStatus) {
    let status: AppModel = {
      ...engineItem
    }

    if (mandatoryConfigured == false) {
      status = {
        ...engineItem,
        detail: 'Ethereal Engine required apps not configured',
        status: AppStatus.NotConfigured
      }
    } else if (engineItem.checkCommand) {
      const response = await exec(engineItem.checkCommand)
      const { stdout, stderr } = response

      if (stdout) {
        window.webContents.send(Channels.Utilities.Log, {
          category: engineItem.name,
          message: typeof stdout === 'string' ? stdout.trim() : stdout
        })
      }
      if (stderr) {
        window.webContents.send(Channels.Utilities.Log, {
          category: engineItem.name,
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
        ...engineItem,
        detail,
        status: itemStatus
      }
    }

    window.webContents.send(Channels.Cluster.CheckEngineStatusResult, status)
  }
}
