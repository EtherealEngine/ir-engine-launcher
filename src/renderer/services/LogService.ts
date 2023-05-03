import { hookstate, none, useHookstate } from '@hookstate/core'
import Channels from 'constants/Channels'
import { AdditionalLogModel, LogModel } from 'models/Log'
import { openPathAction } from 'renderer/common/NotistackActions'

import { store, useDispatch } from '../store'
import { accessSettingsState } from './SettingsService'

type LogState = {
  clusterId: string
  isSaving: boolean
  logs: LogModel[]
  selectedAdditionalLogs?: string
  additionalLogs: AdditionalLogModel[]
}

//State
const state = hookstate<LogState[]>([])

store.receptors.push((action: LogActionType): void => {
  switch (action.type) {
    case 'SET_IS_SAVING': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        state[index].isSaving.set(action.isSaving)
      }
      break
    }
    case 'SET_LOGS': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index === -1) {
        state.merge([
          {
            clusterId: action.clusterId,
            isSaving: false,
            logs: [],
            additionalLogs: []
          } as LogState
        ])
      }
      break
    }
    case 'SET_ADDITIONAL_LOGS': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        const additionalLogsIndex = state[index].additionalLogs.findIndex(
          (item) => item.id.value === action.additionalLogs.id
        )
        if (additionalLogsIndex === -1) {
          state[index].additionalLogs.merge([action.additionalLogs])
        } else {
          state[index].additionalLogs[additionalLogsIndex].set(action.additionalLogs)
        }
      }
      break
    }
    case 'SET_SELECTED_ADDITIONAL_LOGS': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        state[index].selectedAdditionalLogs.set(action.selectedAdditionalLogs)
      }
      break
    }
    case 'REMOVE_LOGS': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        state[index].set(none)
      }
      break
    }
    case 'REMOVE_ADDITIONAL_LOGS': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        const additionalLogsIndex = state[index].additionalLogs.findIndex(
          (item) => item.id.value === action.additionalLogsId
        )
        if (additionalLogsIndex !== -1) {
          state[index].additionalLogs[additionalLogsIndex].set(none)
        }
      }
      break
    }
    case 'LOG_RECEIVED': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        state[index].logs.merge([action.log])
      }
      break
    }
    case 'LOG_CLEAR': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        const selectedAdditionalLogs = state[index].selectedAdditionalLogs.value

        if (selectedAdditionalLogs) {
          const additionalLogsIndex = state[index].additionalLogs.findIndex(
            (item) => item.id.value === selectedAdditionalLogs
          )
          if (additionalLogsIndex !== -1) {
            state[index].additionalLogs[additionalLogsIndex].logs.set([])
          }
        } else {
          state[index].logs.set([])
        }
      }
      break
    }
  }
})

export const accessLogState = () => state

export const useLogState = () => useHookstate(state) as any as typeof state

//Service
export const LogService = {
  initLogs: (clusterId: string) => {
    const dispatch = useDispatch()
    dispatch(LogAction.setLogs(clusterId))
  },
  setAdditionalLogs: (clusterId: string, additionalLogs: AdditionalLogModel) => {
    const dispatch = useDispatch()
    dispatch(LogAction.setAdditionalLogs(clusterId, additionalLogs))
  },
  setSelectedAdditionalLogs: (clusterId: string, selectedAdditionalLogs: string | undefined) => {
    const dispatch = useDispatch()
    dispatch(LogAction.setSelectedAdditionalLogs(clusterId, selectedAdditionalLogs))
  },
  removeLogs: (clusterId: string) => {
    const dispatch = useDispatch()
    dispatch(LogAction.removeLogs(clusterId))
  },
  removeAdditionalLogs: (clusterId: string, additionalLogsId: string) => {
    const dispatch = useDispatch()
    dispatch(LogAction.removeAdditionalLogs(clusterId, additionalLogsId))
  },
  saveLogs: async (clusterId: string) => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    const dispatch = useDispatch()
    try {
      const logState = accessLogState().value.find((item) => item.clusterId === clusterId)
      if (!logState) {
        return
      }

      dispatch(LogAction.setIsSaving(clusterId, true))

      let logs = logState.logs
      let logFileName = logState.clusterId

      if (logState.selectedAdditionalLogs) {
        const additionalLogsIndex = logState.additionalLogs.findIndex(
          (item) => item.id === logState.selectedAdditionalLogs
        )
        if (additionalLogsIndex !== -1) {
          logs = logState.additionalLogs[additionalLogsIndex].logs
          logFileName = logState.additionalLogs[additionalLogsIndex].id
        }
      }

      const contents = logs.map((log) => `${new Date(log.date).toLocaleTimeString()}: ${log.category} - ${log.message}`)

      // https://stackoverflow.com/questions/42210199/remove-illegal-characters-from-a-file-name-but-leave-spaces
      const fileName = `XRE-${logFileName}-${new Date().toJSON()}.txt`.replace(/[/\\?%*:|"<>]/g, '-')
      const path = await window.electronAPI.invoke(Channels.Utilities.SaveLog, clusterId, contents, fileName)

      enqueueSnackbar(`Logs saved ${fileName}.`, {
        variant: 'success',
        autoHideDuration: 10000,
        action: (key) => openPathAction(key, path)
      })
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to save logs. ${error}`, {
        variant: 'error'
      })
    }
    dispatch(LogAction.setIsSaving(clusterId, false))
  },
  clearLogs: async (clusterId: string) => {
    const dispatch = useDispatch()
    dispatch(LogAction.clearLogs(clusterId))
  },
  listen: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Utilities.Log, (clusterId: string | undefined = undefined, data: LogModel) => {
        data.date = new Date().toString()
        if (clusterId) {
          dispatch(LogAction.logReceived(clusterId, data))
          return
        }

        // If no clusterId is specified then its a global log.
        const logState = accessLogState().value
        for (const item of logState) {
          dispatch(LogAction.logReceived(item.clusterId, data))
        }
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const LogAction = {
  setIsSaving: (clusterId: string, isSaving: boolean) => {
    return {
      type: 'SET_IS_SAVING' as const,
      clusterId,
      isSaving
    }
  },
  setLogs: (clusterId: string) => {
    return {
      type: 'SET_LOGS' as const,
      clusterId
    }
  },
  setAdditionalLogs: (clusterId: string, additionalLogs: AdditionalLogModel) => {
    return {
      type: 'SET_ADDITIONAL_LOGS' as const,
      clusterId,
      additionalLogs
    }
  },
  setSelectedAdditionalLogs: (clusterId: string, selectedAdditionalLogs: string | undefined) => {
    return {
      type: 'SET_SELECTED_ADDITIONAL_LOGS' as const,
      clusterId,
      selectedAdditionalLogs
    }
  },
  removeLogs: (clusterId: string) => {
    return {
      type: 'REMOVE_LOGS' as const,
      clusterId
    }
  },
  removeAdditionalLogs: (clusterId: string, additionalLogsId: string) => {
    return {
      type: 'REMOVE_ADDITIONAL_LOGS' as const,
      clusterId,
      additionalLogsId
    }
  },
  logReceived: (clusterId: string, log: LogModel) => {
    return {
      type: 'LOG_RECEIVED' as const,
      clusterId,
      log: log
    }
  },
  clearLogs: (clusterId: string) => {
    return {
      type: 'LOG_CLEAR' as const,
      clusterId
    }
  }
}

export type LogActionType = ReturnType<(typeof LogAction)[keyof typeof LogAction]>
