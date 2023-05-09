import path from 'path'

import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { ClusterModel, ClusterType } from '../../../models/Cluster'
import { KubeconfigType } from '../../../models/Kubeconfig'
import { ensureWSLToWindowsPath, getEngineDefaultPath, getOpsDefaultPath } from '../../managers/PathManager'
import { getValue } from '../../managers/StoreManager'
import { findRequiredValues, getYamlDoc } from '../../managers/YamlManager'

export const getClusters = async () => {
  const clusters = ((await getValue('clusters')) || []) as ClusterModel[]

  for (const cluster of clusters) {
    cluster.configs = await processConfigs(cluster.type, cluster.configs)
    cluster.variables = await processVariables(cluster.type, cluster.configs, cluster.variables)
  }

  return clusters
}

export const processConfigs = async (clusterType: ClusterType, clusterConfigs: Record<string, string> = {}) => {
  if (clusterType === ClusterType.Custom) {
    if (!clusterConfigs[Storage.KUBECONFIG_TYPE]) {
      clusterConfigs[Storage.KUBECONFIG_TYPE] = KubeconfigType.Default.toString()
    }
    if (!clusterConfigs[Storage.KUBECONFIG_PATH]) {
      clusterConfigs[Storage.KUBECONFIG_PATH] = ''
    }
    if (!clusterConfigs[Storage.KUBECONFIG_TEXT]) {
      clusterConfigs[Storage.KUBECONFIG_TEXT] = ''
    }
    if (!clusterConfigs[Storage.KUBECONFIG_CONTEXT]) {
      clusterConfigs[Storage.KUBECONFIG_CONTEXT] = ''
    }
  } else {
    if (!clusterConfigs[Storage.ENGINE_PATH]) {
      clusterConfigs[Storage.ENGINE_PATH] = await getEngineDefaultPath()
    }
    if (!clusterConfigs[Storage.OPS_PATH]) {
      clusterConfigs[Storage.OPS_PATH] = await getOpsDefaultPath()
    }
    if (!clusterConfigs[Storage.ENABLE_RIPPLE_STACK]) {
      clusterConfigs[Storage.ENABLE_RIPPLE_STACK] = 'false'
    }
  }

  return clusterConfigs
}

export const processVariables = async (
  clusterType: ClusterType,
  clusterConfigs: Record<string, string>,
  clusterVars: Record<string, string> = {}
) => {
  if (clusterType === ClusterType.Minikube) {
    const engineVars = await processVariablesFile(
      clusterConfigs,
      clusterVars,
      Endpoints.Paths.MINIKUBE_VALUES_TEMPLATE,
      Endpoints.Urls.MINIKUBE_VALUES_TEMPLATE
    )
    clusterVars = { ...clusterVars, ...engineVars }
  } else if (clusterType === ClusterType.MicroK8s) {
    const engineVars = await processVariablesFile(
      clusterConfigs,
      clusterVars,
      Endpoints.Paths.MICROK8S_VALUES_TEMPLATE,
      Endpoints.Urls.MICROK8S_VALUES_TEMPLATE
    )
    clusterVars = { ...clusterVars, ...engineVars }
  }

  if (clusterConfigs[Storage.ENABLE_RIPPLE_STACK] === 'true') {
    const ipfsVars = await processVariablesFile(
      clusterConfigs,
      clusterVars,
      Endpoints.Paths.IPFS_VALUES_TEMPLATE,
      Endpoints.Urls.IPFS_VALUES_TEMPLATE
    )
    clusterVars = { ...clusterVars, ...ipfsVars }
  }

  return clusterVars
}

export const processVariablesFile = async (
  clusterConfigs: Record<string, string>,
  clusterVars: Record<string, string>,
  templatePath: string,
  templateUrl: string
) => {
  const vars: Record<string, string> = {}

  const opsPath = ensureWSLToWindowsPath(clusterConfigs[Storage.OPS_PATH])
  const templateFullPath = path.join(opsPath, templatePath)
  const yamlDoc = await getYamlDoc(templateFullPath, templateUrl)

  const valuesKey = [] as string[]
  findRequiredValues(yamlDoc, valuesKey)

  valuesKey.sort().forEach((item) => (vars[item] = ''))

  for (const key of Object.keys(clusterVars)) {
    if (key in vars) {
      vars[key] = clusterVars[key]
    }
  }

  return vars
}
