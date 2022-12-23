import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import { Channels } from '../../../constants/Channels'
import { createMainWindow } from '../../main'
import { IBaseHandler } from '../IBaseHandler'
import Updates from './Updates.class'

class UpdatesHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Updates.CheckUpdate, async (_event: IpcMainInvokeEvent) => {
      return await Updates.checkUpdate()
    }),
      ipcMain.handle(Channels.Updates.DownloadUpdate, async (_event: IpcMainInvokeEvent) => {
        await Updates.downloadUpdate(window)
      }),
      ipcMain.handle(Channels.Updates.QuitAndUpdate, (_event: IpcMainInvokeEvent) => {
        Updates.quitAndUpdate()
      }),
      ipcMain.handle(Channels.Updates.LaunchApp, (_event: IpcMainInvokeEvent) => {
        createMainWindow()
      })
  }
}

export default UpdatesHandler
