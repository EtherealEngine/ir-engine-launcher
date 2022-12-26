import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { ClusterModel } from 'models/Cluster'
import { ConfigFileModel } from 'models/ConfigFile'
import { openPathAction } from 'renderer/common/NotistackActions'

import { store, useDispatch } from '../store'
import { accessSettingsState } from './SettingsService'

//State
const state = createState({
  clusters: [] as ClusterModel[],
  version: "" as string,
  loading: true as boolean,
  error: ''
})

store.receptors.push((action: ConfigFileActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_CONFIG':
        return s.merge({
          version: action.payload.version,
          clusters: action.payload.clusters,
          loading: false,
          error: ''
        })

      case 'SET_CLUSTER': {
        const index = s.clusters.findIndex(item => item.id.value === action.payload.id)
        if (index) {
          s.clusters[index].set(action.payload)
        } else {
          s.clusters.merge(action.payload)
        }

        break
      }
      case 'SET_ERROR':
        return s.merge({
          loading: false,
          error: action.payload
        })
    }
  }, action.type)
})

export const accessConfigFileState = () => state

export const useConfigFileState = () => useState(state) as any as typeof state

//Service
export const ConfigFileService = {
  init: async () => {
    const dispatch = useDispatch()

    try {
      const config: ConfigFileModel = await window.electronAPI.invoke(Channels.ConfigFile.LoadConfig)
      dispatch(ConfigFileAction.setConfig(config))
    } catch (error) {
      console.error(error)
      dispatch(
        ConfigFileAction.setError(JSON.stringify(error))
      )
    }
  },

  insertOrUpdateConfig: async (cluster: ClusterModel) => {
    const dispatch = useDispatch()

    try {
      await window.electronAPI.invoke(Channels.ConfigFile.SaveConfig, cluster)
      dispatch(ConfigFileAction.setCluster(cluster))

      // if (configs[Storage.ENABLE_RIPPLE_STACK] && configs[Storage.ENABLE_RIPPLE_STACK] === 'true') {
      //   DeploymentService.fetchAppStatus([...DefaultRippleAppsStatus])
      // } else if (configs[Storage.ENABLE_RIPPLE_STACK] && configs[Storage.ENABLE_RIPPLE_STACK] === 'false') {
      //   DeploymentService.fetchAppStatus([])
      // }

      return true
    } catch (error) {
      console.error(error)
      dispatch(
        ConfigFileAction.setError(JSON.stringify(error))
      )
      return false
    }
  },
  exportSettings: async () => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    try {
      const fileName = `config-${new Date().toJSON()}.json`
      const path = await window.electronAPI.invoke(Channels.ConfigFile.ExportConfig, fileName)

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
      const success = await window.electronAPI.invoke(Channels.ConfigFile.ImportConfig)
      await ConfigFileService.init()

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
}

//Action
export const ConfigFileAction = {
  setConfig: (payload: ConfigFileModel) => {
    return {
      type: 'SET_CONFIG' as const,
      payload
    }
  },
  setCluster: (payload: ClusterModel) => {
    return {
      type: 'SET_CLUSTER' as const,
      payload
    }
  },
  setError: (payload: string) => {
    return {
      type: 'SET_ERROR' as const,
      payload
    }
  }
}

export type ConfigFileActionType = ReturnType<typeof ConfigFileAction[keyof typeof ConfigFileAction]>
