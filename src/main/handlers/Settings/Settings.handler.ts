import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import { Channels } from '../../../constants/Channels'
import { IBaseHandler } from '../IBaseHandler'
import Settings from './Settings.class'

class SettingsHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Settings.CheckConfigs, async (_event: IpcMainInvokeEvent) => {
      return await Settings.checkConfigs(window)
    }),
      ipcMain.handle(Channels.Settings.CheckVars, async (_event: IpcMainInvokeEvent) => {
        return await Settings.checkVars(window)
      }),
      ipcMain.handle(Channels.Settings.GetCurrentAppConfigs, async (_event: IpcMainInvokeEvent) => {
        return await Settings.getCurrentAppConfigs()
      }),
      ipcMain.handle(
        Channels.Settings.SaveConfigs,
        async (_event: IpcMainInvokeEvent, configs: Record<string, string>) => {
          await Settings.saveConfigs(configs, window)
        }
      ),
      ipcMain.handle(Channels.Settings.SaveVars, async (_event: IpcMainInvokeEvent, vars: Record<string, string>) => {
        await Settings.saveVars(vars, window)
      }),
      ipcMain.handle(
        Channels.Settings.ExportSettings,
        async (_event: IpcMainInvokeEvent, fileName: string) => {
          return await Settings.exportSettings(fileName, window)
        }
      ),
      ipcMain.handle(
        Channels.Settings.ImportSettings,
        async (_event: IpcMainInvokeEvent) => {
          return await Settings.importSettings(window)
        }
      )
  }
}

export default SettingsHandler
