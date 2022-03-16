import { clipboard, ipcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log'

import { Channels } from '../../constants/Channels'
import { IBaseHandler } from './IBaseHandler'

class UtilitiesHandler implements IBaseHandler {
  configure = () => {
    ipcMain.handle(Channels.Utilities.CopyClipboard, (_event: IpcMainInvokeEvent, copyText: string) => {
      clipboard.writeText(copyText)
      log.info('Copied to clipboard: ', copyText)
    })
  }
}

export default UtilitiesHandler
