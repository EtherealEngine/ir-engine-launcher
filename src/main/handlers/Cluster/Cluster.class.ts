import { BrowserWindow } from 'electron'
import { DeploymentAppModel } from 'models/AppStatus'

import { Channels } from '../../../constants/Channels'
import { ClusterModel, ClusterType } from '../../../models/Cluster'
import { LogModel } from '../../../models/Log'
import Minikube from '../../Clusters/Minikube/Minikube.class'

class Cluster {
  static getClusterStatus = (window: BrowserWindow, cluster: ClusterModel) => {
    try {
      if (cluster.type === ClusterType.Minikube) {
        return Minikube.getClusterStatus(cluster)
      }
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'get cluster status',
        message: JSON.stringify(err)
      } as LogModel)
    }

    return { appStatus: [], systemStatus: [], engineStatus: [] } as DeploymentAppModel
  }

  static checkClusterStatus = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    deploymentApps: DeploymentAppModel
  ) => {
    try {
      if (cluster.type === ClusterType.Minikube) {
        await Minikube.checkClusterStatus(window, cluster, deploymentApps)
      }
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'check cluster status',
        message: JSON.stringify(err)
      } as LogModel)
    }
  }

  static configureK8Dashboard = async (window: BrowserWindow, cluster: ClusterModel) => {
    try {
      if (cluster.type === ClusterType.Minikube) {
        await Minikube.configureK8Dashboard(window, cluster)
      }
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'K8s dashboard',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  static configureCluster = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    password: string,
    flags: Record<string, string>
  ) => {
    try {
      if (cluster.type === ClusterType.Minikube) {
        await Minikube.configureCluster(window, cluster, password, flags)
      }
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'configure minikube',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }
}

export default Cluster
