import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'

// import log from 'electron-log'
import { Channels } from '../../constants/Channels'
import Endpoints from '../../constants/Endpoints'
import Storage from '../../constants/Storage'
import { IBaseHandler } from './IBaseHandler'

class SettingsHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Settings.CheckPaths, async (_event: IpcMainInvokeEvent) => {
      const category = 'setting paths'
      try {
        const paths: Record<string, string> = {}
        
        if (!paths[Storage.XRENGINE_PATH]) {
          paths[Storage.XRENGINE_PATH] = await getXREnginePath()
        }

        return paths
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category,
          message: JSON.stringify(err)
        })
        throw err
      }
    })
  }
}

export const getXREnginePath = async () => {
  const defaultPath = path.join(app.getPath('home'), Endpoints.DEFAULT_XRENGINE_FOLDER)
  return defaultPath
}

export default SettingsHandler
