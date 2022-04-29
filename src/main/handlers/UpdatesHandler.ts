import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

import { Channels } from '../../constants/Channels'
import { IBaseHandler } from './IBaseHandler'

class UpdatesHandler implements IBaseHandler {
  configure = (_window: BrowserWindow) => {
    ipcMain.handle(Channels.Updates.CheckUpdate, async (_event: IpcMainInvokeEvent) => {
      const currentVersion = app.getVersion()

      const result = await autoUpdater.checkForUpdates()
      log.info(result)

      const response = { currentVersion, latestVersion: result.updateInfo }
      log.info('App Version: ', response)

      return response
    })
  }
}

export default UpdatesHandler
