import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { IBaseHandler } from '../IBaseHandler'
import Shell from './Shell.class'

class ShellHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Shell.CheckSudoPassword, async (_event: IpcMainInvokeEvent, password: string = '') => {
      return await Shell.checkSudoPassword(password)
    }),
      ipcMain.handle(
        Channels.Shell.ExecuteCommand,
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel, command: string) => {
          return await Shell.executeCommand(window, cluster, command)
        }
      ),
      ipcMain.handle(
        Channels.Shell.ConfigureIPFSDashboard,
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel) => {
          await Shell.configureIPFSDashboard(window, cluster)
        }
      ),
      ipcMain.handle(
        Channels.Shell.ExecuteRippledCommand,
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel, command: string) => {
          return await Shell.executeRippledCommand(window, cluster, command)
        }
      )
  }
}

export default ShellHandler
