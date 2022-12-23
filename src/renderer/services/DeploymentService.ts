import { createState, none, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { AppModel, DefaultAppsStatus, DefaultEngineStatus, DefaultSystemStatus } from 'models/AppStatus'

import { store, useDispatch } from '../store'
import { accessSettingsState } from './SettingsService'

//State
const state = createState({
  systemStatus: [...DefaultSystemStatus] as AppModel[],
  appStatus: [...DefaultAppsStatus] as AppModel[],
  engineStatus: [...DefaultEngineStatus] as AppModel[],
  isFetchingStatuses: false as boolean,
  isConfiguring: false as boolean
})

store.receptors.push((action: DeploymentActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_CONFIGURING':
        return s.merge({
          isConfiguring: action.isConfiguring
        })
      case 'SET_FETCHING_STATUSES':
        return s.merge({
          isFetchingStatuses: action.isFetchingStatuses
        })
      case 'FETCH_DEPLOYMENT_STATUS':
        return s.merge({
          isFetchingStatuses: true,
          systemStatus: [...DefaultSystemStatus],
          appStatus: action.appsStatus,
          engineStatus: [...DefaultEngineStatus]
        })
      case 'FETCH_APP_STATUS': {
        s.isFetchingStatuses.set(true)

        const defaultIds = DefaultAppsStatus.map((item) => item.id)

        const removedKeys: any = {}
        for (let index = 0; index < s.appStatus.length; index++) {
          if (defaultIds.includes(s.appStatus.value[index].id) === false) {
            removedKeys[index] = none
          }
        }

        s.appStatus.merge(removedKeys)
        s.appStatus.merge(action.appsStatus)

        break
      }
      case 'SYSTEM_STATUS_RECEIVED': {
        const index = s.systemStatus.value.findIndex((app) => app.id === action.systemStatus.id)
        s.systemStatus.merge({ [index]: action.systemStatus })
        break
      }
      case 'APP_STATUS_RECEIVED': {
        const index = s.appStatus.value.findIndex((app) => app.id === action.appStatus.id)
        s.appStatus.merge({ [index]: action.appStatus })
        break
      }
      case 'ENGINE_STATUS_RECEIVED': {
        const index = s.engineStatus.value.findIndex((app) => app.id === action.engineStatus.id)
        s.engineStatus.merge({ [index]: action.engineStatus })
        break
      }
    }
  }, action.type)
})

export const accessDeploymentState = () => state

export const useDeploymentState = () => useState(state) as any as typeof state

//Service
export const DeploymentService = {
  processConfigurations: async (
    password: string,
    configs: Record<string, string>,
    vars: Record<string, string>,
    flags: Record<string, string>
  ) => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack
    const dispatch = useDispatch()
    try {
      dispatch(DeploymentAction.setConfiguring(true))
      const response = await window.electronAPI.invoke(
        Channels.Shell.ConfigureMinikubeConfig,
        password,
        configs,
        vars,
        flags
      )
      if (response) {
        DeploymentService.fetchDeploymentStatus()
      } else {
        enqueueSnackbar('Failed to configure Ethereal Engine. Please check logs.', {
          variant: 'error'
        })
      }
    } catch (error) {
      console.error(error)
    }
    dispatch(DeploymentAction.setConfiguring(false))
  },
  fetchDeploymentStatus: async () => {
    const dispatch = useDispatch()
    try {
      const appsStatus = await window.electronAPI.invoke(Channels.Settings.GetCurrentAppConfigs)
      dispatch(DeploymentAction.fetchDeploymentStatus(appsStatus))
      await window.electronAPI.invoke(Channels.Shell.CheckMinikubeConfig, appsStatus)
    } catch (error) {
      console.error(error)
    }
    dispatch(DeploymentAction.setFetchingStatuses(false))
  },
  fetchAppStatus: async (appsStatus: AppModel[]) => {
    const dispatch = useDispatch()
    try {
      dispatch(DeploymentAction.fetchAppStatus(appsStatus))
      await window.electronAPI.invoke(Channels.Shell.CheckMinikubeAppConfig, appsStatus)
    } catch (error) {
      console.error(error)
    }
    dispatch(DeploymentAction.setFetchingStatuses(false))
  },
  listen: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Shell.CheckSystemStatusResult, (data: AppModel) => {
        dispatch(DeploymentAction.systemStatusReceived(data))
      })
      window.electronAPI.on(Channels.Shell.CheckAppStatusResult, (data: AppModel) => {
        dispatch(DeploymentAction.appStatusReceived(data))
      })
      window.electronAPI.on(Channels.Shell.CheckEngineStatusResult, (data: AppModel) => {
        dispatch(DeploymentAction.engineStatusReceived(data))
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const DeploymentAction = {
  setConfiguring: (isConfiguring: boolean) => {
    return {
      type: 'SET_CONFIGURING' as const,
      isConfiguring
    }
  },
  setFetchingStatuses: (isFetchingStatuses: boolean) => {
    return {
      type: 'SET_FETCHING_STATUSES' as const,
      isFetchingStatuses
    }
  },
  fetchDeploymentStatus: (appsStatus: AppModel[]) => {
    return {
      type: 'FETCH_DEPLOYMENT_STATUS' as const,
      appsStatus: appsStatus
    }
  },
  fetchAppStatus: (appsStatus: AppModel[]) => {
    return {
      type: 'FETCH_APP_STATUS' as const,
      appsStatus: appsStatus
    }
  },
  systemStatusReceived: (systemStatus: AppModel) => {
    return {
      type: 'SYSTEM_STATUS_RECEIVED' as const,
      systemStatus: systemStatus
    }
  },
  appStatusReceived: (appStatus: AppModel) => {
    return {
      type: 'APP_STATUS_RECEIVED' as const,
      appStatus: appStatus
    }
  },
  engineStatusReceived: (engineStatus: AppModel) => {
    return {
      type: 'ENGINE_STATUS_RECEIVED' as const,
      engineStatus: engineStatus
    }
  }
}

export type DeploymentActionType = ReturnType<typeof DeploymentAction[keyof typeof DeploymentAction]>
