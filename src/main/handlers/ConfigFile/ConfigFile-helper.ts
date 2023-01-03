import path from 'path'

import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { ClusterModel, ClusterType } from '../../../models/Cluster'
import { getEngineDefaultPath } from '../../managers/PathManager'
import { getValue } from '../../managers/StoreManager'
import { findRequiredValues, getYamlDoc } from '../../managers/YamlManager'

export const getClusters = async () => {
  const clusters = ((await getValue('clusters')) || []) as ClusterModel[]

  for (const cluster of clusters) {
    cluster.configs = await processConfigs(cluster.configs)
    cluster.variables = await processVariables(cluster.type, cluster.configs, cluster.variables)
  }

  return clusters
}

export const processConfigs = async (clusterConfigs: Record<string, string> = {}) => {
  if (!clusterConfigs[Storage.ENGINE_PATH]) {
    clusterConfigs[Storage.ENGINE_PATH] = await getEngineDefaultPath()
  }
  if (!clusterConfigs[Storage.ENABLE_RIPPLE_STACK]) {
    clusterConfigs[Storage.ENABLE_RIPPLE_STACK] = 'false'
  }
  return clusterConfigs
}

export const processVariables = async (
  clusterType: ClusterType,
  clusterConfigs: Record<string, string>,
  clusterVars: Record<string, string> = {}
) => {
  if (clusterType === ClusterType.Minikube || clusterType === ClusterType.MicroK8s) {
    const engineVars = await processVariablesFile(
      clusterConfigs,
      clusterVars,
      Endpoints.ENGINE_LOCAL_VALUES_TEMPLATE_PATH,
      Endpoints.ENGINE_LOCAL_VALUES_TEMPLATE_URL
    )
    clusterVars = { ...clusterVars, ...engineVars }
  }

  if (clusterConfigs[Storage.ENABLE_RIPPLE_STACK] === 'true') {
    const ipfsVars = await processVariablesFile(
      clusterConfigs,
      clusterVars,
      Endpoints.IPFS_VALUES_TEMPLATE_PATH,
      Endpoints.IPFS_VALUES_TEMPLATE_URL
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

  const enginePath = clusterConfigs[Storage.ENGINE_PATH]
  const templateFullPath = path.join(enginePath, templatePath)
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
