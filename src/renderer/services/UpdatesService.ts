import { hookstate, useHookstate } from '@hookstate/core'
import Channels from 'constants/Channels'
import { ProgressInfo } from 'electron-updater'

import { store, useDispatch } from '../store'

export enum UpdateStatus {
  Checking,
  Prompt,
  Error,
  Downloading,
  Downloaded
}

//State
const state = hookstate({
  status: UpdateStatus.Downloading,
  checking: 'Checking for updates...',
  error: '',
  newVersion: '',
  progress: undefined as ProgressInfo | undefined
})

store.receptors.push((action: UpdatesActionType): void => {
  switch (action.type) {
    case 'SET_UPDATE_STATUS':
      return state.merge({
        status: action.status
      })
    case 'SET_UPDATE_PROGRESS':
      return state.merge({
        status: UpdateStatus.Downloading,
        progress: action.progress
      })
    case 'SET_UPDATE_CHECKING':
      return state.merge({
        status: UpdateStatus.Checking,
        checking: action.checking,
        progress: undefined
      })
    case 'SET_UPDATE_ERROR':
      return state.merge({
        status: UpdateStatus.Error,
        error: action.error
      })
    case 'SET_UPDATE_VERSION':
      return state.merge({
        status: UpdateStatus.Prompt,
        error: '',
        newVersion: action.newVersion
      })
  }
})

export const accessUpdatesState = () => state

export const useUpdatesState = () => useHookstate(state) as any as typeof state

//Service
export const UpdatesService = {
  checkForUpdates: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(UpdatesAction.setChecking('Checking for updates...'))

      const version: any = await window.electronAPI.invoke(Channels.Updates.CheckUpdate)

      if (version.currentVersion === version.latestVersion) {
        UpdatesService.launchApp()
        return
      }

      dispatch(UpdatesAction.setNewVersion(version.latestVersion))
    } catch (error) {
      console.error(error)
      dispatch(UpdatesAction.setError('Failed to get update.'))
    }
  },
  downloadUpdate: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(UpdatesAction.setStatus(UpdateStatus.Downloading))

      await window.electronAPI.invoke(Channels.Updates.DownloadUpdate)

      dispatch(UpdatesAction.setStatus(UpdateStatus.Downloaded))
    } catch (error) {
      console.error(error)
      dispatch(UpdatesAction.setError('Failed to download update.'))
    }
  },
  launchApp: () => {
    const dispatch = useDispatch()
    dispatch(UpdatesAction.setChecking('Launching app...'))
    window.electronAPI.invoke(Channels.Updates.LaunchApp)
  },
  updateApp: () => {
    const dispatch = useDispatch()
    dispatch(UpdatesAction.setChecking('Updating app...'))
    window.electronAPI.invoke(Channels.Updates.QuitAndUpdate)
  },
  listen: async () => {
    const dispatch = useDispatch()
    window.electronAPI.on(Channels.Updates.DownloadProgress, (progress: ProgressInfo) => {
      dispatch(UpdatesAction.setProgress(progress))
    })
  }
}

//Action
export const UpdatesAction = {
  setStatus: (status: UpdateStatus) => {
    return {
      type: 'SET_UPDATE_STATUS' as const,
      status
    }
  },
  setProgress: (progress: ProgressInfo) => {
    return {
      type: 'SET_UPDATE_PROGRESS' as const,
      progress
    }
  },
  setChecking: (checking: string) => {
    return {
      type: 'SET_UPDATE_CHECKING' as const,
      checking
    }
  },
  setError: (error: string) => {
    return {
      type: 'SET_UPDATE_ERROR' as const,
      error
    }
  },
  setNewVersion: (newVersion: string) => {
    return {
      type: 'SET_UPDATE_VERSION' as const,
      newVersion
    }
  }
}

export type UpdatesActionType = ReturnType<(typeof UpdatesAction)[keyof typeof UpdatesAction]>
