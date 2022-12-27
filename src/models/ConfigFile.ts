import { ClusterModel } from './Cluster'

export const CONFIG_VERSION = "1"

export type ConfigFileModel = {
  version: string
  clusters: ClusterModel[]
}
