import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'

// import log from 'electron-log'
import { Channels } from '../../constants/Channels'
import Endpoints from '../../constants/Endpoints'
import Storage from '../../constants/Storage'
import { getAllValues, getValue, insertOrUpdateValue } from '../dbManager'
import { IBaseHandler } from './IBaseHandler'

class SettingsHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Settings.CheckPaths, async (_event: IpcMainInvokeEvent) => {
      const category = 'setting paths'
      try {
        const paths: Record<string, string> = {}

        const pathsData = await getAllValues(Storage.PATHS_TABLE)
        for (const data of pathsData) {
          paths[data.id] = data.value
        }

        if (!paths[Storage.XRENGINE_PATH]) {
          paths[Storage.XRENGINE_PATH] = await getXREngineDefaultPath()
        }

        return paths
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category,
          message: JSON.stringify(err)
        })
        throw err
      }
    }),
      ipcMain.handle(Channels.Settings.SavePaths, async (_event: IpcMainInvokeEvent, paths: Record<string, string>) => {
        const category = 'save paths'
        try {
          for (const key in paths) {
            await insertOrUpdateValue(Storage.PATHS_TABLE, key, paths[key])
          }
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: 'Setting paths saved.'
          })
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

export const getXREngineDefaultPath = async () => {
  const defaultPath = path.join(app.getPath('home'), Endpoints.DEFAULT_XRENGINE_FOLDER)
  return defaultPath
}

export const getXREnginePath = async () => {
  const xrenginePath = await getValue(Storage.PATHS_TABLE, Storage.XRENGINE_PATH)
  return xrenginePath ? xrenginePath : getXREngineDefaultPath()
}

export default SettingsHandler
