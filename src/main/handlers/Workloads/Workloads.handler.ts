import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { IBaseHandler } from '../IBaseHandler'
import Workloads from './Workloads.class'

class WorkloadsHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Workloads.FetchWorkloads, async (_event: IpcMainInvokeEvent, cluster: ClusterModel) => {
      return await Workloads.fetchWorkloads(window, cluster)
    }),
      ipcMain.handle(Channels.Workloads.RemovePod, async (_event: IpcMainInvokeEvent) => {
        // await Workloads.removePod(window)
      })
  }
}

export default WorkloadsHandler
