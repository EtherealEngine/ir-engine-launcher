export interface Workloads {
  id: string
  label: string
  pods: WorkloadsPodInfo[]
}

export interface WorkloadsPodInfo {
  name: string
  status: string
  age: string | Date
  containers: WorkloadsContainerInfo[]
  type?: string
  locationSlug?: string
  instanceId?: string
  currentUsers?: number
}

export type WorkloadsContainerStatus = 'Running' | 'Terminated' | 'Waiting' | 'Undefined'

export interface WorkloadsContainerInfo {
  name: string
  restarts: number
  status: WorkloadsContainerStatus
  ready: boolean
  started: boolean
  image: string
}
