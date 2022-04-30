import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log'
import { autoUpdater, ProgressInfo } from 'electron-updater'

import { Channels } from '../../constants/Channels'
import { createMainWindow } from '../main'
import { IBaseHandler } from './IBaseHandler'

class UpdatesHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Updates.CheckUpdate, async (_event: IpcMainInvokeEvent) => {
      const currentVersion = app.getVersion()
      let latestVersion = currentVersion

      if (process.env.NODE_ENV !== 'development') {
        autoUpdater.setFeedURL({
          provider: 'github',
          owner: 'xrfoundation',
          repo: 'xrengine-control-center'
        })
        const result = await autoUpdater.checkForUpdates()
        latestVersion = result.updateInfo.version
      }

      const response = { currentVersion, latestVersion }
      log.info('App Version: ', response)

      return response
    }),
      ipcMain.handle(Channels.Updates.DownloadUpdate, async (_event: IpcMainInvokeEvent) => {
        autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
          window.webContents.send(Channels.Updates.DownloadProgress, progressObj)
        })

        await autoUpdater.downloadUpdate()
      }),
      ipcMain.handle(Channels.Updates.QuitAndUpdate, (_event: IpcMainInvokeEvent) => {
        autoUpdater.quitAndInstall(
          true, // isSilent
          true // isForceRunAfter, restart app after update is installed
        )
      }),
      ipcMain.handle(Channels.Updates.LaunchApp, (_event: IpcMainInvokeEvent) => {
        createMainWindow()
      })
  }
}

export default UpdatesHandler
