import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { ClusterModel } from 'models/Cluster'

import Channels from '../../../constants/Channels'
import { DeploymentAppModel } from '../../../models/AppStatus'
import { IBaseHandler } from '../IBaseHandler'
import Cluster from './Cluster.class'
import Minikube from '../../Clusters/Minikube/Minikube.class'

class ClusterHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(
      Channels.Cluster.GetClusterStatus,
      async (_event: IpcMainInvokeEvent, cluster: ClusterModel, sudoPassword?: string) => {
        return await Cluster.getClusterStatus(window, cluster, sudoPassword)
      }
    )
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
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel, password: string, flags: Record<string, string>) => {
          await Cluster.configureCluster(window, cluster, password, flags)
        }
      ),
      ipcMain.handle(
        Channels.Cluster.ConfigureCluster,
        async (_event: IpcMainInvokeEvent, cluster: ClusterModel, password: string, permission: string, flags: Record<string, string>) => {
          await Minikube.checkMok(window, cluster, password, permission, flags)
        }
      )
  }
}

export default ClusterHandler
