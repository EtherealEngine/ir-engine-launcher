import { BrowserWindow } from 'electron'

import { Channels } from '../../../constants/Channels'
import Storage from '../../../constants/Storage'
import { DeploymentAppModel } from '../../../models/AppStatus'
import { ClusterModel } from '../../../models/Cluster'
import { LogModel } from '../../../models/Log'
import { isValidUrl } from '../../managers/PathManager'
import { execStream } from '../../managers/ShellManager'
import { DefaultEngineStatus, DefaultSystemStatus } from '../BaseCluster/BaseCluster.appstatus'
import BaseCluster from '../BaseCluster/BaseCluster.class'
import { MinikubeAppsStatus, MinikubeRippleAppsStatus } from './Minikube.appstatus'
import Commands from './Minikube.commands'
import MinikubeRequirements from './Minikube.requirements'

class Minikube {
  static getClusterStatus = (cluster: ClusterModel) => {
    const systemStatus = [...DefaultSystemStatus]
    const engineStatus = [...DefaultEngineStatus]
    let appStatus = [...MinikubeAppsStatus]

    const enableRipple = cluster.configs[Storage.ENABLE_RIPPLE_STACK]

    if (enableRipple && enableRipple === 'true') {
      appStatus = [...MinikubeAppsStatus, ...MinikubeRippleAppsStatus]
    }

    return { systemStatus, engineStatus, appStatus } as DeploymentAppModel
  }

  static checkClusterStatus = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    deploymentApps: DeploymentAppModel
  ) => {
    await BaseCluster.checkClusterStatus(window, cluster, deploymentApps, MinikubeRequirements)
  }

  static configureK8Dashboard = async (window: BrowserWindow, cluster: ClusterModel) => {
    const category = 'K8s dashboard'
    try {
      const onStdout = (data: any) => {
        const stringData = typeof data === 'string' ? data.trim() : data
        window.webContents.send(Channels.Utilities.Log, cluster.id, { category, message: stringData } as LogModel)
        if (isValidUrl(data)) {
          window.webContents.send(Channels.Cluster.ConfigureK8DashboardResponse, cluster.id, data)
        }
      }
      const onStderr = (data: any) => {
        const stringData = typeof data === 'string' ? data.trim() : data
        window.webContents.send(Channels.Utilities.Log, cluster.id, { category, message: stringData } as LogModel)
        if (stringData.toString().startsWith('*') === false) {
          window.webContents.send(Channels.Cluster.ConfigureK8DashboardError, cluster.id, data)
        }
      }
      await execStream(Commands.MINIKUBE_DASHBOARD, onStdout, onStderr)
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category,
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }
}

export default Minikube
