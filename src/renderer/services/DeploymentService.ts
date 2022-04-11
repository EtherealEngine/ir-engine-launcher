import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { AppModel, DefaultAppsStatus, DefaultClusterStatus, DefaultSystemStatus } from 'models/AppStatus'

import { store, useDispatch } from '../store'

//State
const state = createState({
  systemStatus: [...DefaultSystemStatus] as AppModel[],
  appStatus: [...DefaultAppsStatus] as AppModel[],
  clusterStatus: [...DefaultClusterStatus] as AppModel[]
})

store.receptors.push((action: DeploymentActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'FETCH_DEPLOYMENT_STATUS':
        return s.merge({
          systemStatus: [...DefaultSystemStatus],
          appStatus: [...DefaultAppsStatus],
          clusterStatus: [...DefaultClusterStatus]
        })
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
      case 'CLUSTER_STATUS_RECEIVED': {
        const index = s.clusterStatus.value.findIndex((app) => app.id === action.clusterStatus.id)
        s.clusterStatus.merge({ [index]: action.clusterStatus })
        break
      }
    }
  }, action.type)
})

export const accessDeploymentState = () => state

export const useDeploymentState = () => useState(state) as any as typeof state

//Service
export const DeploymentService = {
  fetchDeploymentStatus: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(DeploymentAction.fetchDeploymentStatus())
      window.electronAPI.invoke(Channels.Shell.CheckMinikubeConfig)
    } catch (error) {
      console.error(error)
    }
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
      window.electronAPI.on(Channels.Shell.CheckClusterStatusResult, (data: AppModel) => {
        dispatch(DeploymentAction.clusterStatusReceived(data))
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const DeploymentAction = {
  fetchDeploymentStatus: () => {
    return {
      type: 'FETCH_DEPLOYMENT_STATUS' as const
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
  clusterStatusReceived: (clusterStatus: AppModel) => {
    return {
      type: 'CLUSTER_STATUS_RECEIVED' as const,
      clusterStatus: clusterStatus
    }
  }
}

export type DeploymentActionType = ReturnType<typeof DeploymentAction[keyof typeof DeploymentAction]>
