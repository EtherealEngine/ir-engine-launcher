export type ClusterModel = {
  id: string
  name: string
  type: ClusterType
  configs: Record<string, string>
  variables: Record<string, string>
}

export enum ClusterType {
  Minikube = "Minikube",
  MicroK8s = "MicroK8s"
}
