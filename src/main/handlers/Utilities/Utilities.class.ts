import Endpoints from '../../../constants/Endpoints'
import { app, BrowserWindow, clipboard, dialog, shell } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'

import { Channels } from '../../../constants/Channels'
import { AppModel, AppStatus } from '../../../models/AppStatus'
import { AppSysInfo, OSType } from '../../../models/AppSysInfo'
import { LogModel } from '../../../models/Log'
import { getHomePath } from '../../managers/PathManager'
import { cleanseString, exec } from '../../managers/ShellManager'
import { WindowsPrerequisites } from './Prerequisites'

class Utilities {
  static copyClipboard = (copyText: string) => {
    clipboard.writeText(copyText)
    log.info('Copied to clipboard: ', copyText)
  }

  static getAppSysInfo = () => {
    const appVersion = app.getVersion()
    const type = os.type()

    let osType = OSType.Undefined
    if (type === 'Linux') {
      osType = OSType.Linux
    } else if (type === 'Darwin') {
      osType = OSType.Mac
    } else if (type === 'Windows_NT') {
      osType = OSType.Windows
    }

    return { appVersion, osType } as AppSysInfo
  }

  static openExternal = async (url: string) => {
    await shell.openExternal(url)
    log.info('Opening external: ', url)
  }

  static openPath = (pathToOpen: string) => {
    shell.showItemInFolder(pathToOpen)
    log.info('Opening path: ', pathToOpen)
  }

  static selectFolder = async () => {
    let defaultPath: string | undefined = undefined

    if (os.type() === 'Windows_NT') {
      const homePath = await getHomePath()
      defaultPath = `${Endpoints.Paths.WSL_PREFIX}${homePath.replaceAll('/', '\\')}`
    }

    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath
    })

    if (filePaths.length > 0) {
      return filePaths[0]
    }

    return ''
  }

  static saveLog = async (clusterId: string, contents: string[], fileName: string, window: BrowserWindow) => {
    try {
      const logPath = path.join(app.getPath('downloads'), fileName)
      const content = contents.join(os.EOL)

      await fs.writeFile(logPath, content)
      log.info('Logs saved at: ', logPath)

      return logPath
    } catch (err) {
      log.error('Failed to save logs.', err)
      window.webContents.send(Channels.Utilities.Log, clusterId, {
        category: 'save logs',
        message: JSON.stringify(err)
      } as LogModel)

      throw err
    }
  }

  static getPrerequisites = () => {
    try {
      const type = os.type()
      if (type === 'Windows_NT') {
        return WindowsPrerequisites
      }
    } catch (err) {
      log.error('Failed to get pre requisites.', err)
    }

    return []
  }

  static checkPrerequisites = async () => {
    try {
      const type = os.type()
      if (type === 'Windows_NT') {
        return await Utilities._checkWindowsPrerequisites()
      }
    } catch (err) {
      log.error('Failed to check prerequisites.', err)
    }

    return []
  }

  private static _checkWindowsPrerequisites = async () => {
    const statuses: AppModel[] = []

    for (const prerequisites of WindowsPrerequisites) {
      let status = AppStatus.NotConfigured

      const { stdout, stderr, error } = await exec(prerequisites.checkCommand)
      const stdOutput = cleanseString(stdout?.toString() || '')

      log.info(`Check command response: ${stdOutput}`)

      if (error || stderr) {
        log.error(
          `Error while executing check ${prerequisites.name} command: ${prerequisites.checkCommand}.`,
          error,
          stderr
        )
      }

      if (
        (prerequisites.id === 'wsl' && stdOutput) ||
        (prerequisites.id === 'wslUbuntu' && stdOutput.includes('Default Distribution: Ubuntu')) ||
        ((prerequisites.id === 'dockerDesktop' || prerequisites.id === 'dockerDesktopUbuntu') &&
          stdOutput.includes('Server: Docker Desktop'))
      ) {
        status = AppStatus.Configured
      }

      statuses.push({
        ...prerequisites,
        detail: stderr ? stderr : stdOutput,
        status
      })
    }

    return statuses
  }
}

export default Utilities
