export type LogModel = {
  category: string
  message: string
  date: string
}

export enum AdditionalLogType {
  Workload
}

export type AdditionalLogModel = {
  id: string
  label: string
  isLoading: boolean
  type: AdditionalLogType
  logs: LogModel[]
}
