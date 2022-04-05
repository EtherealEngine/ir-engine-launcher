import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { LogModel } from 'models/Log'

import { store, useDispatch } from '../store'

//State
const state = createState({
  logs: [] as LogModel[]
})

store.receptors.push((action: LogActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOG_RECEIVED':
        return s.logs.merge([action.log])
      case 'LOG_CLEAR':
        return s.logs.set([])
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
      window.electronAPI.on(Channels.Utilities.Log, (data: LogModel) => {
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
  logReceived: (log: LogModel) => {
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
