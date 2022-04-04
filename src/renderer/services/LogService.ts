import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'

import { store, useDispatch } from '../store'

//State
const state = createState({
  logs: [] as string[]
})

store.receptors.push((action: LogActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOG_RECEIVED':
        return s.merge({
          logs: [...s.logs.value, action.log]
        })
      case 'LOG_CLEAR':
        return s.merge({
          logs: []
        })
    }
  }, action.type)
})

export const accessLogState = () => state

export const useLogState = () => useState(state) as any as typeof state

//Service
export const LogService = {
  listen: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Utilities.Log, (data: string) => {
        dispatch(LogAction.logReceived(data))
      })
    } catch (error) {
      console.error(error)
    }
  },
  clearLogs: async () => {
    const dispatch = useDispatch()
    dispatch(LogAction.clearLogs())
  }
}

//Action
export const LogAction = {
  logReceived: (log: string) => {
    return {
      type: 'LOG_RECEIVED' as const,
      log: log
    }
  },
  clearLogs: () => {
    return {
      type: 'LOG_CLEAR' as const
    }
  }
}

export type LogActionType = ReturnType<typeof LogAction[keyof typeof LogAction]>
