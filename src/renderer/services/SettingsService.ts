import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { OptionsObject, SnackbarMessage } from 'notistack'

import { store, useDispatch } from '../store'

type EnqueueCallback = (message: SnackbarMessage, options?: OptionsObject) => void

type FetchableItem = {
  loading: boolean
  data: any
  error: string
}

//State
const state = createState({
  appVersion: '',
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
  configPaths: {
    loading: false,
    paths: {} as Record<string, string>,
    error: ''
  },
  configVars: {
    loading: false,
    vars: {} as Record<string, string>,
    error: ''
  },
  enqueueSnackbar: undefined as EnqueueCallback | undefined
})

store.receptors.push((action: SettingsActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_APP_VERSION':
        return s.merge({
          appVersion: action.payload
        })
      case 'SET_NOTISTACK':
        return s.merge({
          enqueueSnackbar: action.payload
        })
      case 'SET_CONFIG_PATHS':
        return s.merge({
          configPaths: {
            loading: action.payload.loading,
            paths: action.payload.data,
            error: action.payload.error
          }
        })
      case 'SET_CONFIG_VARS':
        return s.merge({
          configVars: {
            loading: action.payload.loading,
            vars: action.payload.data,
            error: action.payload.error
          }
        })
      case 'SET_CLUSTER_DASHBOARD':
        return s.merge({
          cluster: {
            loading: action.payload.loading,
            url: action.payload.data,
            error: action.payload.error
          }
        })
      case 'SET_ADMIN_PANEL':
        return s.merge({
          adminPanel: {
            loading: action.payload.loading,
            adminAccess: action.payload.data,
            error: action.payload.error
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
  fetchSettings: async () => {
    await SettingsService.fetchAppVersion()
    await SettingsService.fetchPaths()
    await SettingsService.fetchVars()
  },
  fetchAppVersion: async () => {
    const dispatch = useDispatch()
    const version = await window.electronAPI.invoke(Channels.Utilities.GetVersion)
    dispatch(SettingsAction.setAppVersion(version))
  },
  fetchPaths: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setConfigPaths({
          loading: true,
          data: {},
          error: ''
        })
      )
      const response = await window.electronAPI.invoke(Channels.Settings.CheckPaths)
      dispatch(
        SettingsAction.setConfigPaths({
          loading: false,
          data: response,
          error: ''
        })
      )
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setConfigPaths({
          loading: false,
          data: {},
          error: JSON.stringify(error)
        })
      )
    }
  },
  fetchVars: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setConfigVars({
          loading: true,
          data: {},
          error: ''
        })
      )
      const response = await window.electronAPI.invoke(Channels.Settings.CheckVars)
      dispatch(
        SettingsAction.setConfigVars({
          loading: false,
          data: response,
          error: ''
        })
      )
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setConfigVars({
          loading: false,
          data: {},
          error: JSON.stringify(error)
        })
      )
    }
  },
  saveSettings: async (paths: Record<string, string>, vars: Record<string, string>) => {
    let savedPaths = true
    if (paths) {
      savedPaths = await SettingsService.savePaths(paths)
    }

    let savedVars = true
    if (vars) {
      savedVars = await SettingsService.saveVars(vars)
    }

    return savedPaths && savedVars
  },
  savePaths: async (paths: Record<string, string>) => {
    const { configPaths } = accessSettingsState().value
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setConfigPaths({
          loading: true,
          data: { ...configPaths.paths },
          error: ''
        })
      )

      await window.electronAPI.invoke(Channels.Settings.SavePaths, paths)

      const updatedPaths = { ...configPaths.paths }
      for (const key in paths) {
        updatedPaths[key] = paths[key]
      }

      dispatch(
        SettingsAction.setConfigPaths({
          loading: false,
          data: updatedPaths,
          error: ''
        })
      )
      return true
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setConfigPaths({
          loading: false,
          data: { ...configPaths.paths },
          error: JSON.stringify(error)
        })
      )
      return false
    }
  },
  saveVars: async (vars: Record<string, string>) => {
    const { configVars } = accessSettingsState().value
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setConfigVars({
          loading: true,
          data: { ...configVars.vars },
          error: ''
        })
      )

      await window.electronAPI.invoke(Channels.Settings.SaveVars, vars)

      const updatedVars = { ...configVars.vars }
      for (const key in vars) {
        updatedVars[key] = vars[key]
      }

      dispatch(
        SettingsAction.setConfigVars({
          loading: false,
          data: updatedVars,
          error: ''
        })
      )
      return true
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setConfigVars({
          loading: false,
          data: { ...configVars.vars },
          error: JSON.stringify(error)
        })
      )
      return false
    }
  },
  fetchClusterDashboard: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setClusterDashboard({
          loading: true,
          data: '',
          error: ''
        })
      )
      window.electronAPI.invoke(Channels.Shell.ConfigureMinikubeDashboard)
    } catch (error) {
      console.error(error)
    }
  },
  clearClusterDashboard: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setClusterDashboard({
          loading: false,
          data: '',
          error: ''
        })
      )
    } catch (error) {
      console.error(error)
    }
  },
  fetchAdminPanelAccess: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setAdminPanel({
          loading: true,
          data: false,
          error: ''
        })
      )
      window.electronAPI.invoke(Channels.XREngine.EnsureAdminAccess)
    } catch (error) {
      console.error(error)
    }
  },
  clearAdminPanelAccess: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setAdminPanel({
          loading: false,
          data: false,
          error: ''
        })
      )
    } catch (error) {
      console.error(error)
    }
  },
  listen: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Shell.ConfigureMinikubeDashboardResponse, (data: string) => {
        dispatch(
          SettingsAction.setClusterDashboard({
            loading: false,
            data,
            error: ''
          })
        )
      })
      window.electronAPI.on(Channels.Shell.ConfigureMinikubeDashboardError, (error: string) => {
        dispatch(
          SettingsAction.setClusterDashboard({
            loading: false,
            data: '',
            error
          })
        )
      })
      window.electronAPI.on(Channels.XREngine.EnsureAdminAccessResponse, () => {
        dispatch(
          SettingsAction.setAdminPanel({
            loading: false,
            data: true,
            error: ''
          })
        )
      })
      window.electronAPI.on(Channels.XREngine.EnsureAdminAccessError, (error: string) => {
        dispatch(
          SettingsAction.setAdminPanel({
            loading: false,
            data: false,
            error
          })
        )
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const SettingsAction = {
  setAppVersion: (payload: string) => {
    return {
      type: 'SET_APP_VERSION' as const,
      payload
    }
  },
  setNotiStack: (payload: EnqueueCallback) => {
    return {
      type: 'SET_NOTISTACK' as const,
      payload
    }
  },
  setConfigPaths: (payload: FetchableItem) => {
    return {
      type: 'SET_CONFIG_PATHS' as const,
      payload
    }
  },
  setConfigVars: (payload: FetchableItem) => {
    return {
      type: 'SET_CONFIG_VARS' as const,
      payload
    }
  },
  setClusterDashboard: (payload: FetchableItem) => {
    return {
      type: 'SET_CLUSTER_DASHBOARD' as const,
      payload
    }
  },
  setAdminPanel: (payload: FetchableItem) => {
    return {
      type: 'SET_ADMIN_PANEL' as const,
      payload
    }
  }
}

export type SettingsActionType = ReturnType<typeof SettingsAction[keyof typeof SettingsAction]>
