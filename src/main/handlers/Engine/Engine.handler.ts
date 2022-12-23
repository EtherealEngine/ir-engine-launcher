import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

// import log from 'electron-log'
import { Channels } from '../../../constants/Channels'
import { IBaseHandler } from '../IBaseHandler'
import Engine from './Engine.class'

class EngineHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Engine.EnsureAdminAccess, async (_event: IpcMainInvokeEvent) => {
      await Engine.ensureAdminAccess(window)
    })
  }
}

export default EngineHandler
