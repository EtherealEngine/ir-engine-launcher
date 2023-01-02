import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
import CryptoJS from 'crypto-js'
import { SnackbarProvider } from 'notistack'

import { store, useDispatch } from '../store'

//State
const state = createState({
  appVersion: '',
  sudoPassword: '',
  showCreateClusterDialog: false,
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
      case 'SET_CREATE_CLUSTER_DIALOG':
        return s.merge({
          showCreateClusterDialog: action.payload
        })
      case 'SET_NOTISTACK':
        return s.merge({
          notistack: action.payload
        })
    }
  }, action.type)
})

export const accessSettingsState = () => state

export const useSettingsState = () => useState(state) as any as typeof state

//Service
export const SettingsService = {
  init: async () => {
    const dispatch = useDispatch()
    const version = await window.electronAPI.invoke(Channels.Utilities.GetVersion)
    dispatch(SettingsAction.setAppVersion(version))
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
  setCreateClusterDialog: (isVisible: boolean) => {
    const dispatch = useDispatch()
    dispatch(SettingsAction.setCreateClusterDialog(isVisible))
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

export type SettingsActionType = ReturnType<typeof SettingsAction[keyof typeof SettingsAction]>
