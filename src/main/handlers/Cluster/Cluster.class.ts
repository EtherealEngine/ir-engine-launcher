import { BrowserWindow } from 'electron'
import { DeploymentAppModel } from 'models/AppStatus'

import Channels from '../../../constants/Channels'
import { ClusterModel, ClusterType } from '../../../models/Cluster'
import { LogModel } from '../../../models/Log'
import MicroK8s from '../../Clusters/MicroK8s/MicroK8s.class'
import Minikube from '../../Clusters/Minikube/Minikube.class'

class Cluster {
  static getClusterStatus = async (window: BrowserWindow, cluster: ClusterModel, sudoPassword?: string) => {
    try {
      if (cluster.type === ClusterType.Minikube) {
        return await Minikube.getClusterStatus(cluster, sudoPassword)
      } else if (cluster.type === ClusterType.MicroK8s) {
        return await MicroK8s.getClusterStatus(cluster, sudoPassword)
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
      } else if (cluster.type === ClusterType.MicroK8s) {
        await MicroK8s.checkClusterStatus(window, cluster, deploymentApps)
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
      } else if (cluster.type === ClusterType.MicroK8s) {
        await MicroK8s.configureK8Dashboard(window, cluster)
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
      } else if (cluster.type === ClusterType.MicroK8s) {
        await MicroK8s.configureCluster(window, cluster, password, flags)
      }
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'configure cluster',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }
}

export default Cluster
