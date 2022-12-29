import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import { Channels } from '../../../constants/Channels'
import { IBaseHandler } from '../IBaseHandler'
import Shell from './Shell.class'

class ShellHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Shell.CheckSudoPassword, async (_event: IpcMainInvokeEvent, password: string = '') => {
      return await Shell.checkSudoPassword(password)
    }),
      ipcMain.handle(Channels.Shell.ExecuteCommand, async (_event: IpcMainInvokeEvent, command: string) => {
        return await Shell.executeCommand(command, window)
      }),
      ipcMain.handle(Channels.Shell.ConfigureIPFSDashboard, async (_event: IpcMainInvokeEvent) => {
        return await Shell.configureIPFSDashboard(window)
      }),
      ipcMain.handle(Channels.Shell.ExecuteRippledCommand, async (_event: IpcMainInvokeEvent, command: string) => {
        return await Shell.executeRippledCommand(command, window)
      })
  }
}

export default ShellHandler
