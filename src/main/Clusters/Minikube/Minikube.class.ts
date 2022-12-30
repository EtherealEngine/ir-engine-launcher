import { BrowserWindow } from 'electron'
import { DeploymentAppModel } from 'models/AppStatus'

import Storage from '../../../constants/Storage'
import { ClusterModel } from '../../../models/Cluster'
import { DefaultEngineStatus, DefaultSystemStatus } from '../BaseCluster/BaseCluster.appstatus'
import BaseCluster from '../BaseCluster/BaseCluster.class'
import { MinikubeAppsStatus, MinikubeRippleAppsStatus } from './Minikube.appstatus'
import MinikubeRequirements from './Minikube.requirements'

class Minikube {
  static getClusterStatus = (cluster: ClusterModel) => {
    try {
      const systemStatus = [...DefaultSystemStatus]
      const engineStatus = [...DefaultEngineStatus]
      let appStatus = [...MinikubeAppsStatus]

      const enableRipple = cluster.configs[Storage.ENABLE_RIPPLE_STACK]

      if (enableRipple && enableRipple === 'true') {
        appStatus = [...MinikubeAppsStatus, ...MinikubeRippleAppsStatus]
      }

      return { systemStatus, engineStatus, appStatus } as DeploymentAppModel
    } catch (err) {
      throw err
    }
  }

  static checkClusterStatus = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    deploymentApps: DeploymentAppModel
  ) => {
    await BaseCluster.checkClusterStatus(window, cluster, deploymentApps, MinikubeRequirements)
  }
}

export default Minikube
