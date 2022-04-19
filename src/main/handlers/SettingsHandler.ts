import Endpoints from '../../constants/Endpoints'
import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'

// import log from 'electron-log'
import { Channels } from '../../constants/Channels'
import { IBaseHandler } from './IBaseHandler'

class SettingsHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Settings.CheckPaths, async (_event: IpcMainInvokeEvent) => {
      const category = 'setting paths'
      try {
        const xrenginePath = await getXREnginePath()
        return xrenginePath;
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
