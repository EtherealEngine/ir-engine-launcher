import { BrowserWindow } from 'electron'
import log from 'electron-log'
import path from 'path'

import { Channels } from '../../../constants/Channels'
import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { DeploymentAppModel } from '../../../models/AppStatus'
import { ClusterModel } from '../../../models/Cluster'
import { LogModel } from '../../../models/Log'
import { startFileServer } from '../../managers/FileServerManager'
import { assetsPath, ensureConfigsFolder, isValidUrl, scriptsPath } from '../../managers/PathManager'
import { execStream, execStreamScriptFile } from '../../managers/ShellManager'
import { ensureConfigs } from '../../managers/YamlManager'
import { DefaultEngineStatus, DefaultSystemStatus } from '../BaseCluster/BaseCluster.appstatus'
import BaseCluster from '../BaseCluster/BaseCluster.class'
import { MicroK8sAppsStatus, MicroK8sRippleAppsStatus } from './MicroK8s.appstatus'
import Commands from './MicroK8s.commands'
import Requirements from './MicroK8s.requirements'

class MicroK8s {
  static getClusterStatus = (cluster: ClusterModel) => {
    const systemStatus = [...DefaultSystemStatus]
    const engineStatus = [...DefaultEngineStatus]
    let appStatus = [...MicroK8sAppsStatus]

    const enableRipple = cluster.configs[Storage.ENABLE_RIPPLE_STACK]

    if (enableRipple && enableRipple === 'true') {
      appStatus = [...MicroK8sAppsStatus, ...MicroK8sRippleAppsStatus]
    }

    return { systemStatus, engineStatus, appStatus } as DeploymentAppModel
  }

  static checkClusterStatus = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    deploymentApps: DeploymentAppModel
  ) => {
    await BaseCluster.checkClusterStatus(window, cluster, deploymentApps, Requirements)
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
      await execStream(Commands.DASHBOARD, onStdout, onStderr)
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category,
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
    const category = 'configure microk8s'
    try {
      await BaseCluster.ensureVariables(cluster)

      const configsFolder = await ensureConfigsFolder()

      await ensureConfigs(cluster, Endpoints.MICROK8S_VALUES_TEMPLATE_PATH, Endpoints.MICROK8S_VALUES_TEMPLATE_URL)

      const scriptsFolder = scriptsPath()
      const assetsFolder = assetsPath()
      const configureScript = path.join(scriptsFolder, 'configure-microk8s-linux.sh')
      log.info(`Executing script ${configureScript}`)

      const onConfigureStd = (data: any) => {
        window.webContents.send(Channels.Utilities.Log, cluster.id, { category, message: data } as LogModel)
      }
      const code = await execStreamScriptFile(
        configureScript,
        [
          `-a "${assetsFolder}"`,
          `-c "${configsFolder}"`,
          `-d "${flags[Storage.FORCE_DB_REFRESH]}"`,
          `-f "${cluster.configs[Storage.ENGINE_PATH]}"`,
          `-i "${cluster.id}"`,
          `-p "${password}"`,
          `-r "${cluster.configs[Storage.ENABLE_RIPPLE_STACK]}"`
        ],
        onConfigureStd,
        onConfigureStd
      )
      if (code !== 0) {
        throw `Failed with error code ${code}.`
      }

      await startFileServer(window, cluster)
    } catch (err) {
      log.error('Error in configureCluster MicroK8s.', err)
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category,
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }
}

export default MicroK8s
