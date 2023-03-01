import { createState, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { cloneClusterArray, ClusterModel, ClusterType } from 'models/Cluster'
import { CONFIG_VERSION, ConfigFileModel } from 'models/ConfigFile'
import { openPathAction } from 'renderer/common/NotistackActions'

import { store, useDispatch } from '../store'
import { accessDeploymentState, DeploymentService } from './DeploymentService'
import { LogService } from './LogService'
import { accessSettingsState } from './SettingsService'

//State
const state = createState({
  selectedClusterId: '',
  selectedCluster: undefined as ClusterModel | undefined,
  clusters: [] as ClusterModel[],
  version: '' as string,
  loading: true as boolean,
  error: ''
})

store.receptors.push((action: ConfigFileActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_SELECTED_CLUSTER_ID': {
        const selectedCluster = s.clusters.value.find((item) => item.id === action.payload)

        return s.merge({
          selectedClusterId: action.payload,
          selectedCluster
        })
      }

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

      for (const cluster of config.clusters) {
        LogService.setLogs(cluster.id)
        await DeploymentService.getDeploymentStatus(cluster)
      }

      dispatch(ConfigFileAction.setConfig(config))
    } catch (error) {
      console.error(error)
      dispatch(ConfigFileAction.setError(JSON.stringify(error)))
    }
  },

  setSelectedClusterId: (clusterId: string) => {
    const dispatch = useDispatch()
    dispatch(ConfigFileAction.setSelectedClusterId(clusterId))

    if (clusterId) {
      const { isFirstFetched, isFetchingStatuses } = accessDeploymentState().find(
        (item) => item.clusterId.value === clusterId
      )!.value
      const { selectedCluster } = accessConfigFileState().value
      if (!isFirstFetched && !isFetchingStatuses && selectedCluster) {
        DeploymentService.fetchDeploymentStatus(selectedCluster)
      }
    }
  },

  insertOrUpdateConfig: async (cluster: ClusterModel) => {
    const dispatch = useDispatch()
    const { enqueueSnackbar } = accessSettingsState().value.notistack
    const { clusters } = accessConfigFileState()

    try {
      const myClonedClusters = cloneClusterArray(clusters.value)

      const configFile = { clusters: myClonedClusters, version: CONFIG_VERSION } as ConfigFileModel

      const index = configFile.clusters.findIndex((item) => item.id === cluster.id)
      if (index !== -1) {
        configFile.clusters[index] = cluster
      } else {
        configFile.clusters.push(cluster)
      }

      await window.electronAPI.invoke(Channels.ConfigFile.SaveConfig, configFile)

      dispatch(ConfigFileAction.setConfig(configFile))

      LogService.setLogs(cluster.id)
      await DeploymentService.getDeploymentStatus(cluster)

      return true
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to insert/update configuration. ${error}`, {
        variant: 'error'
      })
      return false
    }
  },

  deleteConfig: async (clusterId: string) => {
    const dispatch = useDispatch()
    const { enqueueSnackbar } = accessSettingsState().value.notistack
    const { clusters } = accessConfigFileState()

    try {
      const myClonedClusters = cloneClusterArray(clusters.value)

      const configFile = { clusters: myClonedClusters, version: CONFIG_VERSION } as ConfigFileModel

      const index = configFile.clusters.findIndex((item) => item.id === clusterId)
      if (index === -1) {
        throw 'Unable to find cluster.'
      } else {
        myClonedClusters.splice(index, 1)

        await window.electronAPI.invoke(Channels.ConfigFile.RemoveFiles, clusterId)
        await window.electronAPI.invoke(Channels.ConfigFile.SaveConfig, configFile)

        await DeploymentService.removeDeploymentStatus(clusterId)
        LogService.removeLogs(clusterId)

        dispatch(ConfigFileAction.setConfig(configFile))
      }

      return true
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to delete configuration. ${error}`, {
        variant: 'error'
      })
      return false
    }
  },

  exportSettings: async () => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    try {
      // https://stackoverflow.com/questions/42210199/remove-illegal-characters-from-a-file-name-but-leave-spaces
      const fileName = `config-${new Date().toJSON()}.json`.replace(/[/\\?%*:|"<>]/g, '-')
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
  getDefaultVariables: async (clusterType: ClusterType, clusterConfigs: Record<string, string>) => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack

    try {
      const variables: Record<string, string> = await window.electronAPI.invoke(
        Channels.ConfigFile.GetDefaultVariables,
        clusterType,
        clusterConfigs
      )
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

export type ConfigFileActionType = ReturnType<(typeof ConfigFileAction)[keyof typeof ConfigFileAction]>
