import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { ClusterModel, ClusterType } from 'models/Cluster'
import { ConfigFileModel, CONFIG_VERSION } from 'models/ConfigFile'
import { openPathAction } from 'renderer/common/NotistackActions'

import { store, useDispatch } from '../store'
import { accessSettingsState } from './SettingsService'

//State
const state = createState({
  selectedClusterId: '',
  clusters: [] as ClusterModel[],
  version: '' as string,
  loading: true as boolean,
  error: ''
})

store.receptors.push((action: ConfigFileActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_SELECTED_CLUSTER_ID':
        return s.merge({
          selectedClusterId: action.payload
        })

      case 'SET_CONFIG':
        return s.merge({
          version: action.payload.version,
          clusters: action.payload.clusters,
          loading: false,
          error: ''
        })

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
      dispatch(ConfigFileAction.setError(JSON.stringify(error)))
    }
  },

  setSelectedClusterId: (clusterId: string) => {
    const dispatch = useDispatch()
    dispatch(ConfigFileAction.setSelectedClusterId(clusterId))
  },

  getSelectedCluster: () => {
    const { clusters, selectedClusterId } = accessConfigFileState().value
    const selectedCluster = clusters.find((item) => item.id === selectedClusterId)
    return selectedCluster
  },

  insertOrUpdateConfig: async (cluster: ClusterModel) => {
    const dispatch = useDispatch()
    const { enqueueSnackbar } = accessSettingsState().value.notistack
    const { clusters } = accessConfigFileState().value

    try {
      const configFile = { clusters: [...clusters], version: CONFIG_VERSION } as ConfigFileModel

      const index = configFile.clusters.findIndex((item) => item.id === cluster.id)
      if (index) {
        configFile.clusters[index] = cluster
      } else {
        configFile.clusters.push(cluster)
      }

      await window.electronAPI.invoke(Channels.ConfigFile.SaveConfig, cluster)
      dispatch(ConfigFileAction.setConfig(configFile))

      // if (configs[Storage.ENABLE_RIPPLE_STACK] && configs[Storage.ENABLE_RIPPLE_STACK] === 'true') {
      //   DeploymentService.fetchAppStatus([...DefaultRippleAppsStatus])
      // } else if (configs[Storage.ENABLE_RIPPLE_STACK] && configs[Storage.ENABLE_RIPPLE_STACK] === 'false') {
      //   DeploymentService.fetchAppStatus([])
      // }

      return true
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to update configuration. ${error}`, {
        variant: 'error'
      })
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
          autoHideDuration: 10000
        })
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to import settings. ${error}`, {
        variant: 'error'
      })
    }
  },
  getDefaultConfigs: async () => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    try {
      const configs: Record<string, string> = await window.electronAPI.invoke(Channels.ConfigFile.GetDefaultConfigs)
      return configs
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to get default configs. ${error}`, {
        variant: 'error'
      })
      return {}
    }
  },
  getDefaultVariables: async (clusterType: ClusterType, enginePath: string) => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    try {
      const variables: Record<string, string> = await window.electronAPI.invoke(Channels.ConfigFile.GetDefaultVariables, clusterType, enginePath)
      return variables
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to get default variables. ${error}`, {
        variant: 'error'
      })
      return {}
    }
  }
}

//Action
export const ConfigFileAction = {
  setSelectedClusterId: (payload: string) => {
    return {
      type: 'SET_SELECTED_CLUSTER_ID' as const,
      payload
    }
  },
  setConfig: (payload: ConfigFileModel) => {
    return {
      type: 'SET_CONFIG' as const,
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
