import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { OptionsObject, SnackbarMessage } from 'notistack'

import { store, useDispatch } from '../store'

type EnqueueCallback = (message: SnackbarMessage, options?: OptionsObject) => void


//State
const state = createState({
  cluster: {
    loading: false,
    url: '',
    error: ''
  },
  adminPanel: {
    loading: false,
    adminAccess: false,
    error: ''
  },
  enqueueSnackbar: undefined as EnqueueCallback | undefined,
})

store.receptors.push((action: SettingsActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_NOTISTACK':
        return s.merge({
          enqueueSnackbar: action.payload
        })
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
      case 'FETCH_ADMIN_PANEL_ACCESS':
        return s.merge({
          adminPanel: {
            loading: true,
            adminAccess: false,
            error: ''
          }
        })
      case 'FETCH_ADMIN_PANEL_ACCESS_RESPONSE':
        return s.merge({
          adminPanel: {
            loading: false,
            adminAccess: true,
            error: ''
          }
        })
      case 'FETCH_ADMIN_PANEL_ACCESS_ERROR':
        return s.merge({
          adminPanel: {
            loading: false,
            adminAccess: false,
            error: action.error
          }
        })
      case 'CLEAR_ADMIN_PANEL_ACCESS':
        return s.merge({
          adminPanel: {
            loading: false,
            adminAccess: false,
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
  setNotiStack: async (payload: EnqueueCallback) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setNotiStack(payload))
  },
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
  fetchAdminPanelAccess: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(SettingsAction.fetchAdminPanelAccess())
      window.electronAPI.invoke(Channels.XREngine.EnsureAdminAccess)
    } catch (error) {
      console.error(error)
    }
  },
  clearAdminPanelAccess: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(SettingsAction.clearAdminPanelAccess())
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
      window.electronAPI.on(Channels.XREngine.EnsureAdminAccessResponse, () => {
        dispatch(SettingsAction.fetchAdminPanelAccessResponse())
      })
      window.electronAPI.on(Channels.XREngine.EnsureAdminAccessError, (data: string) => {
        dispatch(SettingsAction.fetchAdminPanelAccessError(data))
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const SettingsAction = {
  setNotiStack: (payload: EnqueueCallback) => {
    return {
      type: 'SET_NOTISTACK' as const,
      payload
    }
  },
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
  },
  fetchAdminPanelAccess: () => {
    return {
      type: 'FETCH_ADMIN_PANEL_ACCESS' as const
    }
  },
  fetchAdminPanelAccessResponse: () => {
    return {
      type: 'FETCH_ADMIN_PANEL_ACCESS_RESPONSE' as const
    }
  },
  fetchAdminPanelAccessError: (error: any) => {
    return {
      type: 'FETCH_ADMIN_PANEL_ACCESS_ERROR' as const,
      error
    }
  },
  clearAdminPanelAccess: () => {
    return {
      type: 'CLEAR_ADMIN_PANEL_ACCESS' as const
    }
  }
}

export type SettingsActionType = ReturnType<typeof SettingsAction[keyof typeof SettingsAction]>
