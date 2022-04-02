import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { AppModel, DefaultApps } from 'models/AppStatus'

import { store, useDispatch } from '../store'

//State
const state = createState({
  appStatus: [] as AppModel[]
})

store.receptors.push((action: AppStatusActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'APP_STATUS_FETCH':
        return s.merge({
          appStatus: [...DefaultApps]
        })
      case 'APP_STATUS_RECEIVED':
        const index = s.appStatus.value.findIndex((app) => app.id === action.appStatus.id)

        s.appStatus.merge({ [index]: action.appStatus })
    }
  }, action.type)
})

export const accessAppStatusState = () => state

export const useAppStatusState = () => useState(state) as any as typeof state

//Service
export const AppStatusService = {
  fetchAppStatus: async (sudoMode: boolean) => {
    const dispatch = useDispatch()
    try {
      dispatch(AppStatusAction.fetchAppStatus())
      window.electronAPI.invoke(Channels.Shell.CheckMinikubeConfig, sudoMode)
    } catch (error) {
      console.error(error)
    }
  },
  listenAppStatus: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Shell.CheckMinikubeConfigResult, (data: AppModel) => {
        dispatch(AppStatusAction.appStatusReceived(data))
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const AppStatusAction = {
  fetchAppStatus: () => {
    return {
      type: 'APP_STATUS_FETCH' as const
    }
  },
  appStatusReceived: (appStatus: AppModel) => {
    return {
      type: 'APP_STATUS_RECEIVED' as const,
      appStatus: appStatus
    }
  }
}

export type AppStatusActionType = ReturnType<typeof AppStatusAction[keyof typeof AppStatusAction]>
