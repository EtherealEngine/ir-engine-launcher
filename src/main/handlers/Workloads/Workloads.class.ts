import * as k8s from '@kubernetes/client-node'
import { BrowserWindow } from 'electron'
import log from 'electron-log'
import os from 'os'
import path from 'path'

import Channels from '../../../constants/Channels'
import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { ClusterModel, ClusterType } from '../../../models/Cluster'
import { KubeconfigType, KubeContext } from '../../../models/Kubeconfig'
import { LogModel } from '../../../models/Log'
import { getHomePath, getWSLPrefixPath } from '../../managers/PathManager'
import Utilities from '../Utilities/Utilities.class'
import { getConfigMap, getDeployments, getPodLogs, getWorkloads, removePod } from './Workloads-helper'

const type = os.type()

class Workloads {
  static getKubeContexts = async (window: BrowserWindow, type: KubeconfigType, typeValue: string) => {
    try {
      const kc = await Workloads._loadK8CustomConfig(type, typeValue)

      const contexts = kc.getContexts()
      const currentContext = kc.getCurrentContext()

      const kubeContexts: KubeContext[] = contexts.map((item) => ({
        ...item,
        isDefault: item.name === currentContext
      }))

      return kubeContexts
    } catch (err) {
      log.error(JSON.stringify(err))
      window.webContents.send(Channels.Utilities.Log, type, typeValue, {
        category: 'kubeconfig',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  static launchClient = async (window: BrowserWindow, cluster: ClusterModel) => {
    try {
      const k8DefaultClient = await Workloads._getK8DefaultClient(cluster)

      let releaseName = 'local'
      if (cluster.type === ClusterType.Custom) {
        releaseName = cluster.configs[Storage.RELEASE_NAME]
      }

      const configMap = await getConfigMap(
        k8DefaultClient,
        `app.kubernetes.io/instance=${releaseName},app.kubernetes.io/component=api,app.kubernetes.io/name=etherealengine`
      )

      let appHost = configMap.length > 0 && configMap[0].data && configMap[0].data['CLIENT_ADDRESS']

      if (!appHost) {
        appHost = configMap.length > 0 && configMap[0].data && configMap[0].data['APP_URL']
      }

      if (!appHost) {
        throw 'Unable to find app host'
      }

      const locationUrl = Endpoints.Urls.LAUNCH_PAGE(appHost)

      await Utilities.openExternal(locationUrl)
    } catch (err) {
      log.error(JSON.stringify(err))
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'launch client',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  static getReleaseNames = async (
    window: BrowserWindow,
    currentContext: string,
    type: KubeconfigType,
    typeValue: string
  ) => {
    const releaseNames: string[] = []
    try {
      const kc = await Workloads._loadK8CustomConfig(type, typeValue)
      kc.setCurrentContext(currentContext)

      const k8AppsClient = kc.makeApiClient(k8s.AppsV1Api)

      const apiDeploys = await getDeployments(
        k8AppsClient,
        `app.kubernetes.io/component=api,app.kubernetes.io/name=etherealengine`
      )

      for (const item of apiDeploys?.body.items || []) {
        const releaseLabel = item.metadata?.labels ? item.metadata?.labels['app.kubernetes.io/instance'] : undefined
        if (releaseLabel) {
          releaseNames.push(releaseLabel)
        }
      }
    } catch (err) {
      log.error(JSON.stringify(err))
      window.webContents.send(Channels.Utilities.Log, type, typeValue, {
        category: 'release name',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }

    return releaseNames
  }

  static getWorkloads = async (window: BrowserWindow, cluster: ClusterModel) => {
    try {
      const k8DefaultClient = await Workloads._getK8DefaultClient(cluster)

      let releaseName = 'local'

      if (cluster.type === ClusterType.Custom) {
        releaseName = cluster.configs[Storage.RELEASE_NAME]
      }

      return await getWorkloads(k8DefaultClient, releaseName)
    } catch (err) {
      log.error(JSON.stringify(err))
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'K8s workloads',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  static removePod = async (window: BrowserWindow, cluster: ClusterModel, podName: string) => {
    try {
      const k8DefaultClient = await Workloads._getK8DefaultClient(cluster)

      return await removePod(k8DefaultClient, podName)
    } catch (err) {
      log.error(JSON.stringify(err))
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'K8s workloads',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  static getPodLogs = async (window: BrowserWindow, cluster: ClusterModel, podName: string, containerName: string) => {
    try {
      const k8DefaultClient = await Workloads._getK8DefaultClient(cluster)

      return await getPodLogs(k8DefaultClient, podName, containerName)
    } catch (err) {
      log.error(JSON.stringify(err))
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'K8s workloads',
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  private static _loadK8CustomConfig = async (type: KubeconfigType, typeValue: string) => {
    const kc = new k8s.KubeConfig()

    if (type === KubeconfigType.File) {
      kc.loadFromFile(typeValue)
    } else if (type === KubeconfigType.Text) {
      kc.loadFromString(typeValue)
    } else {
      kc.loadFromDefault()
    }

    return kc
  }

  private static _getK8DefaultClient = async (cluster: ClusterModel) => {
    let kc = new k8s.KubeConfig()
    kc.loadFromDefault()

    if (cluster.type === ClusterType.Minikube) {
      const contextExists = kc.getContextObject('minikube')
      if (!contextExists) {
        throw 'Unable to find minikube config'
      }

      kc.setCurrentContext('minikube')
    } else if (cluster.type === ClusterType.MicroK8s) {
      const homePath = await getHomePath()
      let configPath = path.join(homePath, '.kube/config-microk8s')

      if (type === 'Windows_NT') {
        const wslPrefixPath = await getWSLPrefixPath()
        configPath = path.join(wslPrefixPath, configPath.replaceAll('/', '\\'))
      }

      kc.loadFromFile(configPath)

      const contextExists = kc.getContextObject('etherealengine-microk8s')
      if (!contextExists) {
        throw 'Unable to find microK8s config'
      }

      kc.setCurrentContext('etherealengine-microk8s')
    } else if (cluster.type === ClusterType.Custom) {
      let typeValue = ''

      if (cluster.configs[Storage.KUBECONFIG_PATH]) {
        typeValue = cluster.configs[Storage.KUBECONFIG_PATH]
      } else if (cluster.configs[Storage.KUBECONFIG_TEXT]) {
        typeValue = Buffer.from(cluster.configs[Storage.KUBECONFIG_TEXT], 'base64').toString()
      }

      kc = await Workloads._loadK8CustomConfig(cluster.configs[Storage.KUBECONFIG_TYPE] as KubeconfigType, typeValue)

      const contextExists = kc.getContextObject(cluster.configs[Storage.KUBECONFIG_CONTEXT])
      if (!contextExists) {
        throw `Unable to find ${cluster.configs[Storage.KUBECONFIG_CONTEXT]} context`
      }

      kc.setCurrentContext(cluster.configs[Storage.KUBECONFIG_CONTEXT])
    }

    const k8DefaultClient = kc.makeApiClient(k8s.CoreV1Api)
    return k8DefaultClient
  }
}

export default Workloads
