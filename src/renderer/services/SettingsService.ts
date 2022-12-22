import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
import CryptoJS from 'crypto-js'
import { DefaultRippleAppsStatus } from 'models/AppStatus'
import { SnackbarProvider } from 'notistack'
import { openPathAction } from 'renderer/common/NotistackActions'

import { store, useDispatch } from '../store'
import { DeploymentService } from './DeploymentService'

type FetchableItem = {
  loading: boolean
  data: any
  error: string
}

//State
const state = createState({
  appVersion: '',
  sudoPassword: '',
  cluster: {
    loading: false,
    url: '',
    error: ''
  },
  ipfs: {
    loading: false,
    url: '',
    error: ''
  },
  adminPanel: {
    loading: false,
    adminAccess: false,
    error: ''
  },
  configs: {
    loading: false,
    data: {} as Record<string, string>,
    error: ''
  },
  vars: {
    loading: false,
    data: {} as Record<string, string>,
    error: ''
  },
  notistack: {} as SnackbarProvider
})

store.receptors.push((action: SettingsActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_APP_VERSION':
        return s.merge({
          appVersion: action.payload
        })
      case 'SET_SUDO_PASSWORD':
        return s.merge({
          sudoPassword: action.payload
        })
      case 'SET_NOTISTACK':
        return s.merge({
          notistack: action.payload
        })
      case 'SET_CONFIGS':
        return s.merge({
          configs: {
            loading: action.payload.loading,
            data: action.payload.data,
            error: action.payload.error
          }
        })
      case 'SET_VARS':
        return s.merge({
          vars: {
            loading: action.payload.loading,
            data: action.payload.data,
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
      case 'SET_IPFS_DASHBOARD':
        return s.merge({
          ipfs: {
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
  setNotiStack: async (callback: SnackbarProvider) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setNotiStack(callback))
  },
  setSudoPassword: (password: string) => {
    const dispatch = useDispatch()
    const encryptedPassword = CryptoJS.AES.encrypt(JSON.stringify(password), Storage.PASSWORD_KEY).toString()
    dispatch(SettingsAction.setSudoPassword(encryptedPassword))
  },
  fetchSettings: async () => {
    await SettingsService.fetchAppVersion()
    await SettingsService.fetchConfigs()
    await SettingsService.fetchVars()
  },
  fetchAppVersion: async () => {
    const dispatch = useDispatch()
    const version = await window.electronAPI.invoke(Channels.Utilities.GetVersion)
    dispatch(SettingsAction.setAppVersion(version))
  },
  fetchConfigs: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setConfigs({
          loading: true,
          data: {},
          error: ''
        })
      )
      const response = await window.electronAPI.invoke(Channels.Settings.CheckConfigs)
      dispatch(
        SettingsAction.setConfigs({
          loading: false,
          data: response,
          error: ''
        })
      )
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setConfigs({
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
        SettingsAction.setVars({
          loading: true,
          data: {},
          error: ''
        })
      )
      const response = await window.electronAPI.invoke(Channels.Settings.CheckVars)
      dispatch(
        SettingsAction.setVars({
          loading: false,
          data: response,
          error: ''
        })
      )
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setVars({
          loading: false,
          data: {},
          error: JSON.stringify(error)
        })
      )
    }
  },
  saveSettings: async (configs: Record<string, string>, vars: Record<string, string>) => {
    let savedConfigs = true
    if (configs) {
      savedConfigs = await SettingsService.saveConfigs(configs)
    }

    let savedVars = true
    if (vars) {
      savedVars = await SettingsService.saveVars(vars)
    }

    if (configs[Storage.ENABLE_RIPPLE_STACK] && configs[Storage.ENABLE_RIPPLE_STACK] === 'true') {
      DeploymentService.fetchAppStatus([...DefaultRippleAppsStatus])
    } else if (configs[Storage.ENABLE_RIPPLE_STACK] && configs[Storage.ENABLE_RIPPLE_STACK] === 'false') {
      DeploymentService.fetchAppStatus([])
    }

    return savedConfigs && savedVars
  },
  saveConfigs: async (configsData: Record<string, string>) => {
    const { configs } = accessSettingsState().value
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setConfigs({
          loading: true,
          data: { ...configs.data },
          error: ''
        })
      )

      await window.electronAPI.invoke(Channels.Settings.SaveConfigs, configsData)

      const updatedData = { ...configs.data }
      for (const key in configsData) {
        updatedData[key] = configsData[key]
      }

      dispatch(
        SettingsAction.setConfigs({
          loading: false,
          data: updatedData,
          error: ''
        })
      )
      return true
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setConfigs({
          loading: false,
          data: { ...configs.data },
          error: JSON.stringify(error)
        })
      )
      return false
    }
  },
  saveVars: async (varsData: Record<string, string>) => {
    const { vars } = accessSettingsState().value
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setVars({
          loading: true,
          data: { ...vars.data },
          error: ''
        })
      )

      await window.electronAPI.invoke(Channels.Settings.SaveVars, varsData)

      const updatedVars = { ...vars.data }
      for (const key in varsData) {
        updatedVars[key] = varsData[key]
      }

      dispatch(
        SettingsAction.setVars({
          loading: false,
          data: updatedVars,
          error: ''
        })
      )
      return true
    } catch (error) {
      console.error(error)
      dispatch(
        SettingsAction.setVars({
          loading: false,
          data: { ...vars.data },
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
  fetchIpfsDashboard: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setIpfsDashboard({
          loading: true,
          data: '',
          error: ''
        })
      )
      window.electronAPI.invoke(Channels.Shell.ConfigureIPFSDashboard)
    } catch (error) {
      console.error(error)
    }
  },
  clearIpfsDashboard: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(
        SettingsAction.setIpfsDashboard({
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
      window.electronAPI.invoke(Channels.Engine.EnsureAdminAccess)
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
  exportSettings: async () => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    try {
      const fileName = `config-${new Date().toJSON()}.json`
      const path = await window.electronAPI.invoke(Channels.Settings.ExportSettings, fileName)

      enqueueSnackbar(`Settings exported ${fileName}.`, {
        variant: 'success',
        autoHideDuration: 10000,
        action: (key) => openPathAction(key, path)
      })
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to export settings. ${error}`, {
        variant: 'error'
      })
    }
  },
  importSettings: async () => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    try {
      const success = await window.electronAPI.invoke(Channels.Settings.ImportSettings)
      await SettingsService.fetchConfigs()
      await SettingsService.fetchVars()

      if (success) {
        enqueueSnackbar(`Settings imported.`, {
          variant: 'success',
          autoHideDuration: 10000,
        })
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to import settings. ${error}`, {
        variant: 'error'
      })
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
      window.electronAPI.on(Channels.Shell.ConfigureIPFSDashboardResponse, (data: string) => {
        dispatch(
          SettingsAction.setIpfsDashboard({
            loading: false,
            data,
            error: ''
          })
        )
      })
      window.electronAPI.on(Channels.Shell.ConfigureIPFSDashboardError, (error: string) => {
        dispatch(
          SettingsAction.setIpfsDashboard({
            loading: false,
            data: '',
            error
          })
        )
      })
      window.electronAPI.on(Channels.Engine.EnsureAdminAccessResponse, () => {
        dispatch(
          SettingsAction.setAdminPanel({
            loading: false,
            data: true,
            error: ''
          })
        )
      })
      window.electronAPI.on(Channels.Engine.EnsureAdminAccessError, (error: string) => {
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
  setSudoPassword: (payload: string) => {
    return {
      type: 'SET_SUDO_PASSWORD' as const,
      payload
    }
  },
  setNotiStack: (payload: SnackbarProvider) => {
    return {
      type: 'SET_NOTISTACK' as const,
      payload
    }
  },
  setConfigs: (payload: FetchableItem) => {
    return {
      type: 'SET_CONFIGS' as const,
      payload
    }
  },
  setVars: (payload: FetchableItem) => {
    return {
      type: 'SET_VARS' as const,
      payload
    }
  },
  setClusterDashboard: (payload: FetchableItem) => {
    return {
      type: 'SET_CLUSTER_DASHBOARD' as const,
      payload
    }
  },
  setIpfsDashboard: (payload: FetchableItem) => {
    return {
      type: 'SET_IPFS_DASHBOARD' as const,
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
