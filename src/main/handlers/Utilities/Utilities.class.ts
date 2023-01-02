import { app, BrowserWindow, clipboard, dialog, shell } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import { EOL } from 'os'
import path from 'path'

import { Channels } from '../../../constants/Channels'
import { LogModel } from '../../../models/Log'

class Utilities {
  static copyClipboard = (copyText: string) => {
    clipboard.writeText(copyText)
    log.info('Copied to clipboard: ', copyText)
  }

  static getVersion = () => {
    const version = app.getVersion()
    return version
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
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (filePaths.length > 0) {
      return filePaths[0]
    }

    return ''
  }

  static saveLog = async (clusterId: string, contents: string[], fileName: string, window: BrowserWindow) => {
    try {
      const logPath = path.join(app.getPath('downloads'), fileName)
      const content = contents.join(EOL)

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
}

export default Utilities
