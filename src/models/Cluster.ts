export type ClusterModel = {
  id: string
  name: string
  type: ClusterType
  configs: Record<string, string>
  variables: Record<string, string>
}

export enum ClusterType {
  MicroK8s = 'MicroK8s',
  Minikube = 'Minikube',
  Custom = 'Custom Kubernetes'
}

export const cloneCluster = (cluster: ClusterModel) => {
  const clonedCluster: ClusterModel = {
    ...cluster,
    configs: Object.assign({}, cluster.configs),
    variables: Object.assign({}, cluster.variables)
  }

  return clonedCluster
}

export const cloneClusterArray = (clusters: Array<ClusterModel>) => {
  const myClonedClusters: ClusterModel[] = []

  for (const cluster of clusters) {
    const clonedCluster = cloneCluster(cluster)
    myClonedClusters.push(clonedCluster)
  }

  return myClonedClusters
}
