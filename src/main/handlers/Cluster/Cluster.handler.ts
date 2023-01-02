import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { ClusterModel } from 'models/Cluster'

import { Channels } from '../../../constants/Channels'
import { DeploymentAppModel } from '../../../models/AppStatus'
import { IBaseHandler } from '../IBaseHandler'
import Cluster from './Cluster.class'

class ClusterHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Cluster.GetClusterStatus, (_event: IpcMainInvokeEvent, cluster: ClusterModel) => {
      return Cluster.getClusterStatus(window, cluster)
    })
    ipcMain.handle(
      Channels.Cluster.CheckClusterStatus,
      async (_event: IpcMainInvokeEvent, cluster: ClusterModel, deploymentApps: DeploymentAppModel) => {
        await Cluster.checkClusterStatus(window, cluster, deploymentApps)
      }
    ),
      ipcMain.handle(
        Channels.Cluster.ConfigureK8Dashboard,
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel) => {
          await Cluster.configureK8Dashboard(window, cluster)
        }
      ),
      ipcMain.handle(
        Channels.Cluster.ConfigureCluster,
        async (
          _event: IpcMainInvokeEvent,
          cluster: ClusterModel,
          password: string,
          flags: Record<string, string>
        ) => {
          await Cluster.configureCluster(window, cluster, password, flags)
        }
      )
  }
}

export default ClusterHandler
