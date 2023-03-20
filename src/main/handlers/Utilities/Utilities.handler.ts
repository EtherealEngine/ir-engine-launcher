import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import Channels from '../../../constants/Channels'
import { AppModel } from '../../../models/AppStatus'
import { IBaseHandler } from '../IBaseHandler'
import Utilities from './Utilities.class'

class UtilitiesHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Utilities.CopyClipboard, (_event: IpcMainInvokeEvent, copyText: string) => {
      Utilities.copyClipboard(copyText)
    }),
      ipcMain.handle(Channels.Utilities.GetAppSysInfo, (_event: IpcMainInvokeEvent) => {
        return Utilities.getAppSysInfo()
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
        async (_event: IpcMainInvokeEvent, clusterId: string, contents: string[], fileName: string) => {
          return await Utilities.saveLog(clusterId, contents, fileName, window)
        }
      ),
      ipcMain.handle(Channels.Utilities.GetPrerequisites, async (_event: IpcMainInvokeEvent) => {
        return await Utilities.getPrerequisites()
      }),
      ipcMain.handle(
        Channels.Utilities.CheckPrerequisite,
        async (_event: IpcMainInvokeEvent, prerequisite: AppModel) => {
          return await Utilities.checkPrerequisite(prerequisite)
        }
      )
  }
}

export default UtilitiesHandler
