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
    await processConfigs(cluster)
    await processVariables(cluster)
  }

  return clusters
}

const processConfigs = async (cluster: ClusterModel) => {
  if (!cluster.configs[Storage.ENGINE_PATH]) {
    cluster.configs[Storage.ENGINE_PATH] = await getEngineDefaultPath()
  }
  if (!cluster.configs[Storage.ENABLE_RIPPLE_STACK]) {
    cluster.configs[Storage.ENABLE_RIPPLE_STACK] = 'false'
  }
}

const processVariables = async (cluster: ClusterModel) => {
  if (cluster.type === ClusterType.Minikube || cluster.type === ClusterType.MicroK8s) {
    processLocalVariables(cluster)
  }
}

const processLocalVariables = async (cluster: ClusterModel) => {
  const vars: Record<string, string> = {}

  const templatePath = path.join(cluster.configs[Storage.ENGINE_PATH], Endpoints.ENGINE_LOCAL_VALUES_TEMPLATE_PATH)
  const yamlDoc = await getYamlDoc(templatePath, Endpoints.ENGINE_LOCAL_VALUES_TEMPLATE_URL)

  const valuesKey = [] as string[]
  findRequiredValues(yamlDoc, valuesKey)

  valuesKey.sort().forEach((item) => (vars[item] = ''))

  for (const key of Object.keys(cluster.variables)) {
    if (key in vars) {
      vars[key] = cluster.variables[key]
    }
  }

  cluster.variables = vars
}
