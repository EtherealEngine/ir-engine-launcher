import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

// import log from 'electron-log'
import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { IBaseHandler } from '../IBaseHandler'
import Engine from './Engine.class'

class EngineHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Engine.EnsureAdminAccess, async (_event: IpcMainInvokeEvent, cluster: ClusterModel) => {
      await Engine.ensureAdminAccess(window, cluster)
    }),
      ipcMain.handle(Channels.Engine.StartFileServer, async (_event: IpcMainInvokeEvent, cluster: ClusterModel) => {
        await Engine.startFileServer(window, cluster)
      })
  }
}

export default EngineHandler
