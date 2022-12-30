import { BrowserWindow } from 'electron'
// import log from 'electron-log'
// import { promises as fs } from 'fs'
import { DeploymentAppModel } from 'models/AppStatus'

// import path from 'path'
// import { kill } from 'ps-node'
import { Channels } from '../../../constants/Channels'
import { ClusterModel, ClusterType } from '../../../models/Cluster'
// import Storage from '../../../constants/Storage'
// import { AppModel } from '../../../models/AppStatus'
// import Commands from '../../Clusters/Minikube/Minikube.commands'
// import { appConfigsPath, assetsPath, fileExists, isValidUrl, scriptsPath } from '../../managers/PathManager'
// import { execStream } from '../../managers/ShellManager'
// import { checkAppStatus, checkEngineStatus, checkSystemStatus } from './Cluster-helper'
import Minikube from '../../Clusters/Minikube/Minikube.class'

class Cluster {
  static getClusterStatus = (window: BrowserWindow, cluster: ClusterModel) => {
    try {
      if (cluster.type === ClusterType.Minikube) {
        return Minikube.getClusterStatus(cluster)
      }
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category: 'get cluster status',
        message: JSON.stringify(err)
      })
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
      window.webContents.send(Channels.Utilities.Log, {
        category: 'check cluster status',
        message: JSON.stringify(err)
      })
    }
  }

  // static checkMinikubeAppConfig = async (appsStatus: AppModel[], window: BrowserWindow) => {
  //   try {
  //     await checkAppStatus(window, appsStatus)
  //   } catch (err) {
  //     window.webContents.send(Channels.Utilities.Log, {
  //       category: 'check minikube config',
  //       message: JSON.stringify(err)
  //     })
  //   }
  // }

  // static configureMinikubeConfig = async (
  //   password: string,
  //   configs: Record<string, string>,
  //   vars: Record<string, string>,
  //   flags: Record<string, string>,
  //   window: BrowserWindow
  // ) => {
  //   const category = 'configure minikube'
  //   try {
  //     await ensureVariables(configs[Storage.ENGINE_PATH], vars)

  //     const configsFolder = path.resolve(appConfigsPath())
  //     const configsFolderExists = await fileExists(configsFolder)
  //     if (configsFolderExists === false) {
  //       await fs.mkdir(configsFolder, { recursive: true })
  //     }

  //     await ensureEngineConfigs(configs[Storage.ENGINE_PATH], vars)
  //     await ensureRippleConfigs(configs[Storage.ENGINE_PATH], configs[Storage.ENABLE_RIPPLE_STACK])

  //     const scriptsFolder = scriptsPath()
  //     const assetsFolder = assetsPath()
  //     const configureScript = path.join(scriptsFolder, 'configure-minikube.sh')
  //     log.info(`Executing script ${configureScript}`)

  //     const onConfigureStd = (data: any) => {
  //       window.webContents.send(Channels.Utilities.Log, { category, message: data })
  //     }
  //     const code = await execStream(
  //       `bash "${configureScript}" -a "${assetsFolder}" -c "${configsFolder}" -d "${flags[Storage.FORCE_DB_REFRESH]
  //       }" -f "${configs[Storage.ENGINE_PATH]}" -p "${password}" -r "${configs[Storage.ENABLE_RIPPLE_STACK]}"`,
  //       onConfigureStd,
  //       onConfigureStd
  //     )
  //     if (code !== 0) {
  //       throw `Failed with error code ${code}.`
  //     }

  //     // Below block of code is to ensure file server is stopped when app is closed.
  //     const existingServer = await getProcessList('http-server')
  //     if (existingServer && existingServer.length === 0) {
  //       app.on('before-quit', async (e) => {
  //         try {
  //           e.preventDefault()

  //           const existingServers = await getProcessList('http-server')
  //           existingServers.forEach((httpProcess) => {
  //             kill(httpProcess.pid)
  //           })
  //         } catch { }

  //         app.quit()
  //         process.exit()
  //       })
  //     }

  //     const fileServerScript = path.join(scriptsFolder, 'configure-file-server.sh')

  //     const onFileServerStd = (data: any) => {
  //       try {
  //         window.webContents.send(Channels.Utilities.Log, { category: 'file server', message: data })
  //       } catch { }
  //     }

  //     execStream(`bash "${fileServerScript}" -f "${configs[Storage.ENGINE_PATH]}"`, onFileServerStd, onFileServerStd)

  //     return true
  //   } catch (err) {
  //     log.error('Error in ConfigureMinikubeConfig.', err)
  //     window.webContents.send(Channels.Utilities.Log, {
  //       category,
  //       message: JSON.stringify(err)
  //     })
  //     return false
  //   }
  // }

  // static configureK8Dashboard = async (window: BrowserWindow) => {
  //   const category = 'K8s dashboard'
  //   try {
  //     const onStdout = (data: any) => {
  //       const stringData = typeof data === 'string' ? data.trim() : data
  //       window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
  //       if (isValidUrl(data)) {
  //         window.webContents.send(Channels.Cluster.ConfigureK8DashboardResponse, data)
  //       }
  //     }
  //     const onStderr = (data: any) => {
  //       const stringData = typeof data === 'string' ? data.trim() : data
  //       window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
  //       if (stringData.toString().startsWith('*') === false) {
  //         window.webContents.send(Channels.Cluster.ConfigureK8DashboardError, data)
  //       }
  //     }
  //     await execStream(Commands.MINIKUBE_DASHBOARD, onStdout, onStderr)
  //   } catch (err) {
  //     window.webContents.send(Channels.Utilities.Log, {
  //       category,
  //       message: JSON.stringify(err)
  //     })
  //     return err
  //   }
  // }
}

export default Cluster
