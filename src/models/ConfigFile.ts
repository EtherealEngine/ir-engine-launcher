import { ClusterModel } from "./Cluster"

export type ConfigFileModel = {
    version: string
    clusters: ClusterModel[]
}