import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import { Channels } from '../../../constants/Channels'
import { ClusterType } from '../../../models/Cluster'
import { ConfigFileModel } from '../../../models/ConfigFile'
import { IBaseHandler } from '../IBaseHandler'
import ConfigFile from './ConfigFile.class'

class ConfigFileHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.ConfigFile.LoadConfig, async (_event: IpcMainInvokeEvent) => {
      return await ConfigFile.loadConfig(window)
    })
    ipcMain.handle(Channels.ConfigFile.SaveConfig, async (_event: IpcMainInvokeEvent, config: ConfigFileModel) => {
      return await ConfigFile.saveConfig(window, config)
    })
    ipcMain.handle(Channels.ConfigFile.ExportConfig, async (_event: IpcMainInvokeEvent, fileName: string) => {
      return await ConfigFile.exportConfig(window, fileName)
    })
    ipcMain.handle(Channels.ConfigFile.ImportConfig, async (_event: IpcMainInvokeEvent) => {
      return await ConfigFile.importConfig(window)
    })
    ipcMain.handle(Channels.ConfigFile.GetDefaultConfigs, async (_event: IpcMainInvokeEvent) => {
      return await ConfigFile.getDefaultConfigs(window)
    })
    ipcMain.handle(
      Channels.ConfigFile.GetDefaultVariables,
      async (_event: IpcMainInvokeEvent, clusterType: ClusterType, enginePath: string) => {
        return await ConfigFile.getDefaultVariables(window, clusterType, enginePath)
      }
    )
  }
}

export default ConfigFileHandler
