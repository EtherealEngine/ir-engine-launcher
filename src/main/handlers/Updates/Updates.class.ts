import { app, BrowserWindow } from 'electron'
import log from 'electron-log'
import { autoUpdater, ProgressInfo } from 'electron-updater'

import Channels from '../../../constants/Channels'

class Updates {
  static checkUpdate = async () => {
    const currentVersion = app.getVersion()
    let latestVersion = currentVersion

    if (process.env.NODE_ENV !== 'development') {
      const result = await autoUpdater.checkForUpdates()
      latestVersion = result.updateInfo.version
    }

    const response = { currentVersion, latestVersion }
    log.info('App Version: ', response)

    return response
  }

  static downloadUpdate = async (window: BrowserWindow) => {
    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
      window.webContents.send(Channels.Updates.DownloadProgress, progressObj)
    })

    await autoUpdater.downloadUpdate()
  }

  static quitAndUpdate = () => {
    autoUpdater.quitAndInstall(
      true, // isSilent
      true // isForceRunAfter, restart app after update is installed
    )
  }
}

export default Updates
