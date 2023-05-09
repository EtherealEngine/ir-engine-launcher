import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { KubeconfigType } from 'models/Kubeconfig'

import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { IBaseHandler } from '../IBaseHandler'
import Workloads from './Workloads.class'

class WorkloadsHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Workloads.GetWorkloads, async (_event: IpcMainInvokeEvent, cluster: ClusterModel) => {
      return await Workloads.getWorkloads(window, cluster)
    }),
      ipcMain.handle(
        Channels.Workloads.GetKubeContexts,
        async (_event: IpcMainInvokeEvent, type: KubeconfigType, typeValue: string) => {
          return await Workloads.getKubeContexts(window, type, typeValue)
        }
      ),
      ipcMain.handle(
        Channels.Workloads.RemovePod,
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel, podName: string) => {
          await Workloads.removePod(window, cluster, podName)
        }
      ),
      ipcMain.handle(
        Channels.Workloads.GetPodLogs,
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel, podName: string, containerName: string) => {
          return await Workloads.getPodLogs(window, cluster, podName, containerName)
        }
      )
  }
}

export default WorkloadsHandler
