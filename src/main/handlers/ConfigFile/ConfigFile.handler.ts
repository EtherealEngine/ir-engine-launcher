import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import { Channels } from '../../../constants/Channels'
import { ConfigFileModel } from '../../../models/ConfigFile'
import { IBaseHandler } from '../IBaseHandler'
import ConfigFile from './ConfigFile.class'

class ConfigFileHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.ConfigFile.LoadConfig, async (_event: IpcMainInvokeEvent) => {
      return await ConfigFile.loadConfig(window)
    })
    ipcMain.handle(Channels.ConfigFile.SaveConfig, async (_event: IpcMainInvokeEvent, config: ConfigFileModel) => {
      return await ConfigFile.saveConfig(config, window)
    })
    ipcMain.handle(Channels.ConfigFile.ExportConfig, async (_event: IpcMainInvokeEvent, fileName: string) => {
      return await ConfigFile.exportConfig(fileName, window)
    })
    ipcMain.handle(Channels.ConfigFile.ImportConfig, async (_event: IpcMainInvokeEvent) => {
      return await ConfigFile.importConfig(window)
    })
  }
}

export default ConfigFileHandler
