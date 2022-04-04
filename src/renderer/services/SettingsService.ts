import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'

import { store, useDispatch } from '../store'

//State
const state = createState({
  sudoMode: false,
  cluster: {
    loading: false,
    url: '',
    error: ''
  }
})

store.receptors.push((action: SettingsActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'FETCH_CLUSTER_DASHBOARD':
        return s.merge({
          cluster: {
            loading: true,
            url: '',
            error: ''
          }
        })
      case 'FETCH_CLUSTER_DASHBOARD_RESPONSE':
        return s.merge({
          cluster: {
            loading: false,
            url: action.response,
            error: ''
          }
        })
      case 'FETCH_CLUSTER_DASHBOARD_ERROR':
        return s.merge({
          cluster: {
            loading: false,
            url: '',
            error: action.error
          }
        })
      case 'CLEAR_CLUSTER_DASHBOARD':
        return s.merge({
          cluster: {
            loading: false,
            url: '',
            error: ''
          }
        })
    }
  }, action.type)
})

export const accessSettingsState = () => state

export const useSettingsState = () => useState(state) as any as typeof state

//Service
export const SettingsService = {
  fetchClusterDashboard: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(SettingsAction.fetchClusterDashboard())
      window.electronAPI.invoke(Channels.Shell.ConfigureMinikubeDashboard)
    } catch (error) {
      console.error(error)
    }
  },
  clearClusterDashboard: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(SettingsAction.clearClusterDashboard())
    } catch (error) {
      console.error(error)
    }
  },
  listen: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Shell.ConfigureMinikubeDashboardResponse, (data: string) => {
        dispatch(SettingsAction.fetchClusterDashboardResponse(data))
      })
      window.electronAPI.on(Channels.Shell.ConfigureMinikubeDashboardError, (data: string) => {
        dispatch(SettingsAction.fetchClusterDashboardError(data))
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const SettingsAction = {
  fetchClusterDashboard: () => {
    return {
      type: 'FETCH_CLUSTER_DASHBOARD' as const
    }
  },
  fetchClusterDashboardResponse: (response: any) => {
    return {
      type: 'FETCH_CLUSTER_DASHBOARD_RESPONSE' as const,
      response
    }
  },
  fetchClusterDashboardError: (error: any) => {
    return {
      type: 'FETCH_CLUSTER_DASHBOARD_ERROR' as const,
      error
    }
  },
  clearClusterDashboard: () => {
    return {
      type: 'CLEAR_CLUSTER_DASHBOARD' as const
    }
  }
}

export type SettingsActionType = ReturnType<typeof SettingsAction[keyof typeof SettingsAction]>
