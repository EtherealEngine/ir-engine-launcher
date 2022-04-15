import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { LogModel } from 'models/Log'
import { openPathAction } from 'renderer/components/NotistackActions'

import { store, useDispatch } from '../store'
import { accessSettingsState } from './SettingsService'

//State
const state = createState({
  isSavingLogs: false as boolean,
  logs: [] as LogModel[]
})

store.receptors.push((action: LogActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_IS_SAVING':
        return s.merge({
          isSavingLogs: action.isSaving
        })
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
  saveLogs: async () => {
    const { enqueueSnackbar } = accessSettingsState().value
    const { logs } = accessLogState().value
    
    const dispatch = useDispatch()
    try {
      dispatch(LogAction.setIsSaving(true))

      const contents = logs.map((log) => `${new Date(log.date).toLocaleTimeString()}: ${log.category} - ${log.message}`)
      const fileName = `XRE-logs-${new Date().toJSON()}.txt`
      const path = await window.electronAPI.invoke(Channels.Utilities.SaveLog, contents, fileName)
      if (!path) {
        throw 'Failed to save logs.'
      }

      enqueueSnackbar!(`Logs saved ${fileName}.`, {
        variant: 'success',
        action: (key) => openPathAction(key, path)
      })
    } catch (error) {
      console.error(error)
      enqueueSnackbar!(`Failed to save logs. ${error}`, {
        variant: 'error'
      })
    }
    dispatch(LogAction.setIsSaving(false))
  },
  listen: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Utilities.Log, (data: LogModel) => {
        data.date = new Date().toString()
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
  setIsSaving: (isSaving: boolean) => {
    return {
      type: 'SET_IS_SAVING' as const,
      isSaving: isSaving
    }
  },
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
