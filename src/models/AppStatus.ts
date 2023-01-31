import React from 'react'

export type AppModel = {
  id: string
  name: string
  description?: React.ReactNode
  checkCommand: string
  isLinuxCommand: boolean
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
  isLinuxCommand: boolean = true,
  description: string = '',
  detail: string = '',
  status: AppStatus = AppStatus.Checking,
  isOptional?: boolean
) => {
  return { id, name, checkCommand, isLinuxCommand, description, detail, status, isOptional }
}
