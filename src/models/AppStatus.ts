import React from 'react'

export type AppModel = {
  id: string
  name: string
  description?: React.ReactNode
  checkCommand: string
  detail: React.ReactNode | undefined
  status: AppStatus
  isOptional?: boolean
}

export enum AppStatus {
  Checking,
  Configured,
  NotConfigured,
  Pending
}

export type DeploymentAppModel = {
  systemStatus: AppModel[]
  engineStatus: AppModel[]
  appStatus: AppModel[]
}

export const getAppModel = (
  id: string,
  name: string,
  checkCommand: string = '',
  description: string = '',
  detail: string = '',
  status: AppStatus = AppStatus.Checking,
  isOptional?: boolean
) => {
  return { id, name, checkCommand, description, detail, status, isOptional }
}
