import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import { Channels } from '../../../constants/Channels'
import { IBaseHandler } from '../IBaseHandler'
import Utilities from './Utilities.class'

class UtilitiesHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Utilities.CopyClipboard, (_event: IpcMainInvokeEvent, copyText: string) => {
      Utilities.copyClipboard(copyText)
    }),
      ipcMain.handle(Channels.Utilities.GetVersion, (_event: IpcMainInvokeEvent) => {
        return Utilities.getVersion()
      }),
      ipcMain.handle(Channels.Utilities.OpenExternal, async (_event: IpcMainInvokeEvent, url: string) => {
        await Utilities.openExternal(url)
      }),
      ipcMain.handle(Channels.Utilities.OpenPath, (_event: IpcMainInvokeEvent, pathToOpen: string) => {
        Utilities.openPath(pathToOpen)
      }),
      ipcMain.handle(Channels.Utilities.SelectFolder, async (_event: IpcMainInvokeEvent) => {
        return await Utilities.selectFolder()
      }),
      ipcMain.handle(
        Channels.Utilities.SaveLog,
        async (_event: IpcMainInvokeEvent, contents: string[], fileName: string) => {
          return await Utilities.saveLog(contents, fileName, window)
        }
      )
  }
}

export default UtilitiesHandler
