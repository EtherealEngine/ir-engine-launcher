import { BrowserWindow, clipboard, ipcMain, IpcMainInvokeEvent, shell } from 'electron'
import log from 'electron-log'

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
      })
  }
}

export default UtilitiesHandler
