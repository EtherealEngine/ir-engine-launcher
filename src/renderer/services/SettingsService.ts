import { hookstate, useHookstate } from '@hookstate/core'
import { decryptPassword, delay } from 'common/UtilitiesManager'
import Channels from 'constants/Channels'
import Storage from 'constants/Storage'
import CryptoJS from 'crypto-js'
import { AppModel } from 'models/AppStatus'
import { AppSysInfo, OSType } from 'models/AppSysInfo'
import { ClusterModel } from 'models/Cluster'
import { SnackbarProvider } from 'notistack'

import { store, useDispatch } from '../store'

//State
const state = hookstate({
  appSysInfo: {
    osType: OSType.Undefined,
    appVersion: ''
  } as AppSysInfo,
  sudoPassword: '',
  showAuthenticationDialog: false,
  showCreateClusterDialog: false,
  showEnrollMokDialog: false,
  mokCluster: {} as ClusterModel,
  showMokRestartDialog: false,
  notistack: {} as SnackbarProvider
})

store.receptors.push((action: SettingsActionType): void => {
  switch (action.type) {
    case 'SET_APP_SYS_INFO':
      return state.merge({
        appSysInfo: action.payload
      })
    case 'SET_SUDO_PASSWORD':
      return state.merge({
        sudoPassword: action.payload
      })
    case 'SET_AUTHENTICATION_DIALOG':
      return state.merge({
        showAuthenticationDialog: action.payload
      })
    case 'SET_MOK_CLUSTER':
      return state.merge({
        mokCluster: action.payload
      })
    case 'SET_ENROLL_MOK_DIALOG':
      return state.merge({
        showEnrollMokDialog: action.payload
      })
    case 'SET_MOK_RESTART_DIALOG':
      return state.merge({
        showMokRestartDialog: action.payload
      })
    case 'SET_CREATE_CLUSTER_DIALOG':
      return state.merge({
        showCreateClusterDialog: action.payload
      })
    case 'SET_NOTISTACK':
      return state.merge({
        notistack: action.payload
      })
  }
})

export const accessSettingsState = () => state

export const useSettingsState = () => useHookstate(state) as any as typeof state

//Service
export const SettingsService = {
  init: async () => {
    const dispatch = useDispatch()
    const appSysInfo: AppSysInfo = await window.electronAPI.invoke(Channels.Utilities.GetAppSysInfo)
    dispatch(SettingsAction.setAppSysInfo(appSysInfo))
  },
  setNotiStack: async (callback: SnackbarProvider) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setNotiStack(callback))
  },
  setSudoPassword: (password: string) => {
    const dispatch = useDispatch()
    const encryptedPassword = CryptoJS.AES.encrypt(JSON.stringify(password), Storage.PASSWORD_KEY).toString()
    dispatch(SettingsAction.setSudoPassword(encryptedPassword))
  },
  getDecryptedSudoPassword: async () => {
    let sudoPassword = accessSettingsState().value.sudoPassword

    if (!sudoPassword) {
      SettingsService.setAuthenticationDialog(true)

      while (!sudoPassword) {
        await delay(1000)
        sudoPassword = accessSettingsState().value.sudoPassword
      }
    }

    const password = decryptPassword(sudoPassword)
    return password
  },
  setAuthenticationDialog: (isVisible: boolean) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setAuthenticationDialog(isVisible))
  },
  setCreateClusterDialog: (isVisible: boolean) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setCreateClusterDialog(isVisible))
  },
  setMokCluster: (cluster: ClusterModel) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setMokCluster(cluster))
  },
  setEnrollMokDialog: (isVisible: boolean) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setEnrollMokDialog(isVisible))
  },
  setMokRestartDialog: (isVisible: boolean) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setMokRestartDialog(isVisible))
  },
  getPrerequisites: async () => {
    const statuses: AppModel[] = await window.electronAPI.invoke(Channels.Utilities.GetPrerequisites)
    return statuses
  },
  checkPrerequisite: async (prerequisite: AppModel) => {
    const status: AppModel = await window.electronAPI.invoke(Channels.Utilities.CheckPrerequisite, prerequisite)
    return status
  },
  listen: async () => {
    const dispatch = useDispatch()
    window.electronAPI.on(Channels.Cluster.SetupMok, (cluster: ClusterModel) => {
      dispatch(SettingsAction.setMokCluster(cluster))
      dispatch(SettingsAction.setEnrollMokDialog(true))
      return
    })
  }
}

//Action
export const SettingsAction = {
  setAppSysInfo: (payload: AppSysInfo) => {
    return {
      type: 'SET_APP_SYS_INFO' as const,
      payload
    }
  },
  setSudoPassword: (payload: string) => {
    return {
      type: 'SET_SUDO_PASSWORD' as const,
      payload
    }
  },
  setAuthenticationDialog: (payload: boolean) => {
    return {
      type: 'SET_AUTHENTICATION_DIALOG' as const,
      payload
    }
  },
  setMokCluster: (payload: ClusterModel) => {
    return {
      type: 'SET_MOK_CLUSTER' as const,
      payload
    }
  },
  setMokRestartDialog: (payload: boolean) => {
    return {
      type: 'SET_MOK_RESTART_DIALOG' as const,
      payload
    }
  },
  setEnrollMokDialog: (payload: boolean) => {
    return {
      type: 'SET_ENROLL_MOK_DIALOG' as const,
      payload
    }
  },
  setCreateClusterDialog: (payload: boolean) => {
    return {
      type: 'SET_CREATE_CLUSTER_DIALOG' as const,
      payload
    }
  },
  setNotiStack: (payload: SnackbarProvider) => {
    return {
      type: 'SET_NOTISTACK' as const,
      payload
    }
  }
}

export type SettingsActionType = ReturnType<(typeof SettingsAction)[keyof typeof SettingsAction]>
