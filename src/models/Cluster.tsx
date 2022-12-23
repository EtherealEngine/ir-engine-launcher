export type ClusterModel = {
  id: string
  name: string
  type: ClusterType
}

export enum ClusterType {
  Minikube,
  MicroK8s
}
