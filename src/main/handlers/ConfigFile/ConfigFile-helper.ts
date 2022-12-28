import { getEngineDefaultPath } from '../../managers/PathManager'
import { findRequiredValues, getYamlDoc } from '../../managers/YamlManager'
import { ClusterModel, ClusterType } from '../../../models/Cluster'
import path from 'path'

import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { getValue } from '../../managers/StoreManager'

export const getClusters = async () => {
  const clusters = (await getValue('clusters') || []) as ClusterModel[]

  for (const cluster of clusters) {
    cluster.configs = await processConfigs(cluster.configs)
    cluster.variables = await processVariables(cluster.type, cluster.configs[Storage.ENGINE_PATH], cluster.variables)
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

export const processVariables = async (clusterType: ClusterType, enginePath: string, clusterVars: Record<string, string> = {}) => {
  if (clusterType === ClusterType.Minikube || clusterType === ClusterType.MicroK8s) {
    return await processLocalVariables(enginePath, clusterVars)
  }

  return clusterVars
}

const processLocalVariables = async (enginePath: string, clusterVars: Record<string, string>) => {
  const vars: Record<string, string> = {}

  const templatePath = path.join(enginePath, Endpoints.ENGINE_LOCAL_VALUES_TEMPLATE_PATH)
  const yamlDoc = await getYamlDoc(templatePath, Endpoints.ENGINE_LOCAL_VALUES_TEMPLATE_URL)

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
