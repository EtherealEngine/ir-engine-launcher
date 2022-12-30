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
    )
    //   ipcMain.handle(
    //     Channels.Cluster.CheckMinikubeAppConfig,
    //     async (_event: IpcMainInvokeEvent, appsStatus: AppModel[]) => {
    //       await Cluster.checkMinikubeAppConfig(appsStatus, window)
    //     }
    //   ),
    //   ipcMain.handle(
    //     Channels.Cluster.ConfigureMinikubeConfig,
    //     async (
    //       _event: IpcMainInvokeEvent,
    //       password: string,
    //       configs: Record<string, string>,
    //       vars: Record<string, string>,
    //       flags: Record<string, string>
    //     ) => {
    //       return await Cluster.configureMinikubeConfig(password, configs, vars, flags, window)
    //     }
    //   ),
    //   ipcMain.handle(Channels.Cluster.ConfigureK8Dashboard, async (_event: IpcMainInvokeEvent) => {
    //     return await Cluster.configureK8Dashboard(window)
    //   })
  }
}

export default ClusterHandler
