import { app, BrowserWindow, clipboard, ipcMain, IpcMainInvokeEvent, shell } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import { EOL } from 'os'
import path from 'path'

import { Channels } from '../../constants/Channels'
import { IBaseHandler } from './IBaseHandler'

class UtilitiesHandler implements IBaseHandler {
  configure = (_window: BrowserWindow) => {
    ipcMain.handle(Channels.Utilities.CopyClipboard, (_event: IpcMainInvokeEvent, copyText: string) => {
      clipboard.writeText(copyText)
      log.info('Copied to clipboard: ', copyText)
    }),
      ipcMain.handle(Channels.Utilities.OpenExternal, async (_event: IpcMainInvokeEvent, url: string) => {
        await shell.openExternal(url)
        log.info('Opening external: ', url)
      }),
      ipcMain.handle(Channels.Utilities.OpenPath, (_event: IpcMainInvokeEvent, pathToOpen: string) => {
        shell.showItemInFolder(pathToOpen)
        log.info('Opening path: ', pathToOpen)
      }),
      ipcMain.handle(
        Channels.Utilities.SaveLog,
        async (_event: IpcMainInvokeEvent, contents: string[], fileName: string) => {
          try {
            const logPath = path.join(app.getPath('downloads'), fileName)
            const content = contents.join(EOL)
            
            await fs.writeFile(logPath, content)
            log.info('Logs saved at: ', logPath)

            return logPath
          } catch (err) {
            log.error('Failed to save logs.', err)
            _window.webContents.send(Channels.Utilities.Log, { category: 'log', message: JSON.stringify(err) })

            return ''
          }
        }
      )
  }
}

export default UtilitiesHandler
