import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'

import { store, useDispatch } from '../store'

export enum UpdateStatus {
  Checking,
  Prompt,
  Downloading,
  Error
}

//State
const state = createState({
  status: UpdateStatus.Checking,
  error: '' as string,
  newVersion: '' as string
})

store.receptors.push((action: UpdatesActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_UPDATE_STATUS':
        return s.merge({
          status: action.status
        })
      case 'SET_UPDATE_ERROR':
        return s.merge({
          status: UpdateStatus.Error,
          error: action.error
        })
      case 'SET_UPDATE_VERSION':
        return s.merge({
          status: UpdateStatus.Prompt,
          error: '',
          newVersion: action.newVersion
        })
    }
  }, action.type)
})

export const accessUpdatesState = () => state

export const useUpdatesState = () => useState(state) as any as typeof state

//Service
export const UpdatesService = {
  checkForUpdates: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(UpdatesAction.setStatus(UpdateStatus.Checking))

      const version = await window.electronAPI.invoke(Channels.Updates.CheckUpdate)

      dispatch(UpdatesAction.setNewVersion(version))
    } catch (error) {
      console.error(error)
      dispatch(UpdatesAction.setError(JSON.stringify(error)))
    }
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

export type UpdatesActionType = ReturnType<typeof UpdatesAction[keyof typeof UpdatesAction]>
