export type ClusterModel = {
  id: string
  name: string
  type: ClusterType
  configs: Record<string, string>
  variables: Record<string, string>
}

export enum ClusterType {
  Minikube = 'Minikube',
  MicroK8s = 'MicroK8s'
}

export const cloneCluster = (cluster: ClusterModel) => {
  const clonedCluster: ClusterModel = {
    ...cluster,
    configs: Object.assign({}, cluster.configs),
    variables: Object.assign({}, cluster.variables)
  }

  return clonedCluster
}

export const cloneClusterArray = (clusters: ClusterModel[]) => {
  const myClonedClusters: ClusterModel[] = []

  for (const cluster of clusters) {
    const clonedCluster = cloneCluster(cluster)
    myClonedClusters.push(clonedCluster)
  }

  return myClonedClusters
}
