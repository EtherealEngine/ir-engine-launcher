import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import { Channels } from '../../../constants/Channels'
import { AppModel } from '../../../models/AppStatus'
import { IBaseHandler } from '../IBaseHandler'
import Shell from './Shell.class'

class ShellHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Shell.CheckMinikubeConfig, async (_event: IpcMainInvokeEvent, appsStatus: AppModel[]) => {
      await Shell.checkMinikubeConfig(appsStatus, window)
    }),
      ipcMain.handle(
        Channels.Shell.CheckMinikubeAppConfig,
        async (_event: IpcMainInvokeEvent, appsStatus: AppModel[]) => {
          await Shell.checkMinikubeAppConfig(appsStatus, window)
        }
      ),
      ipcMain.handle(Channels.Shell.CheckSudoPassword, async (_event: IpcMainInvokeEvent, password: string = '') => {
        return await Shell.checkSudoPassword(password)
      }),
      ipcMain.handle(
        Channels.Shell.ConfigureMinikubeConfig,
        async (
          _event: IpcMainInvokeEvent,
          password: string,
          configs: Record<string, string>,
          vars: Record<string, string>,
          flags: Record<string, string>
        ) => {
          return await Shell.configureMinikubeConfig(password, configs, vars, flags, window)
        }
      ),
      ipcMain.handle(Channels.Shell.ConfigureMinikubeDashboard, async (_event: IpcMainInvokeEvent) => {
        return await Shell.configureMinikubeDashboard(window)
      }),
      ipcMain.handle(Channels.Shell.ConfigureIPFSDashboard, async (_event: IpcMainInvokeEvent) => {
        return await Shell.configureIPFSDashboard(window)
      }),
      ipcMain.handle(Channels.Shell.ExecuteRippledCommand, async (_event: IpcMainInvokeEvent, command: string) => {
        return await Shell.executeRippledCommand(command, window)
      }),
      ipcMain.handle(Channels.Shell.ExecuteCommand, async (_event: IpcMainInvokeEvent, command: string) => {
        return await Shell.executeCommand(command, window)
      })
  }
}

export default ShellHandler
