import { createState, none, useState } from '@speigg/hookstate'
import { Channels } from 'constants/Channels'
import { AppModel, DeploymentAppModel } from 'models/AppStatus'
import { cloneCluster, ClusterModel } from 'models/Cluster'

import { store, useDispatch } from '../store'

type DeploymentItem = {
  clusterId: string
  isConfiguring: boolean
  isFirstFetched: boolean
  isFetchingStatuses: boolean
  systemStatus: AppModel[]
  appStatus: AppModel[]
  engineStatus: AppModel[]
}

//State
const state = createState({
  deployments: [] as DeploymentItem[]
})

store.receptors.push((action: DeploymentActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_CONFIGURING': {
        const index = s.deployments.findIndex((item) => item.clusterId.value === action.cluster.id)
        if (index !== -1) {
          s.deployments[index].isConfiguring.set(action.isConfiguring)
        }
        break
      }
      case 'SET_FETCHING_STATUSES': {
        try {
          const index = s.deployments.findIndex((item) => item.clusterId.value === action.cluster.id)
          if (index !== -1) {
            s.deployments[index].isFetchingStatuses.set(action.isFetchingStatuses)
  
            if (action.isFetchingStatuses === false) {
              s.deployments[index].isFirstFetched.set(true)
            }
          }
        }catch (err) {
          console.log(err)
        }
        break
      }
      case 'SET_DEPLOYMENT_APPS': {
        const index = s.deployments.findIndex((item) => item.clusterId.value === action.cluster.id)
        if (index !== -1) {
          s.deployments.merge({
            [index]: {
              ...s.deployments[index].value,
              isFetchingStatuses: true,
              systemStatus: [...action.deploymentApps.systemStatus],
              appStatus: [...action.deploymentApps.appStatus],
              engineStatus: [...action.deploymentApps.engineStatus]
            } as DeploymentItem
          })
        } else {
          s.deployments.merge([
            {
              clusterId: action.cluster.id,
              isConfiguring: false,
              isFirstFetched: false,
              isFetchingStatuses: true,
              systemStatus: [...action.deploymentApps.systemStatus],
              appStatus: [...action.deploymentApps.appStatus],
              engineStatus: [...action.deploymentApps.engineStatus]
            } as DeploymentItem
          ])
        }
        break
      }
      case 'REMOVE_DEPLOYMENT': {
        const index = s.deployments.findIndex((item) => item.clusterId.value === action.clusterId)
        if (index !== -1) {
          s.deployments[index].set(none)
        }
        break
      }
      // case 'FETCH_APP_STATUS': {
      //   s.isFetchingStatuses.set(true)

      //   const defaultIds = DefaultAppsStatus.map((item) => item.id)

      //   const removedKeys: any = {}
      //   for (let index = 0; index < s.appStatus.length; index++) {
      //     if (defaultIds.includes(s.appStatus.value[index].id) === false) {
      //       removedKeys[index] = none
      //     }
      //   }

      //   s.appStatus.merge(removedKeys)
      //   s.appStatus.merge(action.appsStatus)

      //   break
      // }
      case 'SYSTEM_STATUS_RECEIVED': {
        const index = s.deployments.findIndex((item) => item.clusterId.value === action.cluster.id)
        if (index !== -1) {
          const statusIndex = s.deployments[index].systemStatus.findIndex(
            (app) => app.id.value === action.systemStatus.id
          )
          s.deployments[index].systemStatus.merge({ [statusIndex]: action.systemStatus })
        }
        break
      }
      case 'APP_STATUS_RECEIVED': {
        const index = s.deployments.findIndex((item) => item.clusterId.value === action.cluster.id)
        if (index !== -1) {
          const statusIndex = s.deployments[index].appStatus.findIndex((app) => app.id.value === action.appStatus.id)
          s.deployments[index].appStatus.merge({ [statusIndex]: action.appStatus })
        }
        break
      }
      case 'ENGINE_STATUS_RECEIVED': {
        const index = s.deployments.findIndex((item) => item.clusterId.value === action.cluster.id)
        if (index !== -1) {
          const statusIndex = s.deployments[index].engineStatus.findIndex(
            (app) => app.id.value === action.engineStatus.id
          )
          s.deployments[index].engineStatus.merge({ [statusIndex]: action.engineStatus })
        }
        break
      }
    }
  }, action.type)
})

export const accessDeploymentState = () => state

export const useDeploymentState = () => useState(state) as any as typeof state

//Service
export const DeploymentService = {
  getDeploymentStatus: async (cluster: ClusterModel) => {
    // Here we are cloning cluster object so that when selected Cluster is changed, 
    // The context cluster does not change.
    const clonedCluster = cloneCluster(cluster)
    const dispatch = useDispatch()

    try {
      const deploymentApps: DeploymentAppModel = await window.electronAPI.invoke(
        Channels.Cluster.GetClusterStatus,
        clonedCluster
      )
      dispatch(DeploymentAction.setDeploymentApps(clonedCluster, deploymentApps))
      return deploymentApps
    } catch (error) {
      console.error(error)
      return undefined
    }
  },
  fetchDeploymentStatus: async (cluster: ClusterModel) => {
    // Here we are cloning cluster object so that when selected Cluster is changed, 
    // The context cluster does not change.
    const clonedCluster = cloneCluster(cluster)
    const dispatch = useDispatch()

    try {
      const deploymentApps = await DeploymentService.getDeploymentStatus(clonedCluster)
      if (deploymentApps) {
        await window.electronAPI.invoke(Channels.Cluster.CheckClusterStatus, clonedCluster, deploymentApps)
      }
    } catch (error) {
      console.error(error)
    }
    dispatch(DeploymentAction.setFetchingStatuses(clonedCluster, false))
  },
  removeDeploymentStatus: async (clusterId: string) => {
    const dispatch = useDispatch()
    
    try {
      dispatch(DeploymentAction.removeDeployment(clusterId))
    } catch (error) {
      console.error(error)
    }
  },
  fetchAppStatus: async (appsStatus: AppModel[]) => {
    // const dispatch = useDispatch()
    // try {
    //   dispatch(DeploymentAction.fetchAppStatus(cluster, appsStatus))
    //   await window.electronAPI.invoke(Channels.Cluster.CheckMinikubeAppConfig, appsStatus)
    // } catch (error) {
    //   console.error(error)
    // }
    // dispatch(DeploymentAction.setFetchingStatuses(cluster, false))
  },
  processConfigurations: async (
    password: string,
    configs: Record<string, string>,
    vars: Record<string, string>,
    flags: Record<string, string>
  ) => {
    // const { enqueueSnackbar } = accessSettingsState().value.notistack
    // const dispatch = useDispatch()
    // try {
    //   dispatch(DeploymentAction.setConfiguring(cluster, true))
    //   const response = await window.electronAPI.invoke(
    //     Channels.Cluster.ConfigureMinikubeConfig,
    //     password,
    //     configs,
    //     vars,
    //     flags
    //   )
    //   if (response) {
    //     DeploymentService.fetchDeploymentStatus(cluster)
    //   } else {
    //     enqueueSnackbar('Failed to configure Ethereal Engine. Please check logs.', {
    //       variant: 'error'
    //     })
    //   }
    // } catch (error) {
    //   console.error(error)
    // }
    // dispatch(DeploymentAction.setConfiguring(cluster, false))
  },
  listen: async () => {
    const dispatch = useDispatch()
    try {
      window.electronAPI.on(Channels.Cluster.CheckSystemStatusResult, (cluster: ClusterModel, data: AppModel) => {
        dispatch(DeploymentAction.systemStatusReceived(cluster, data))
      })
      window.electronAPI.on(Channels.Cluster.CheckAppStatusResult, (cluster: ClusterModel, data: AppModel) => {
        dispatch(DeploymentAction.appStatusReceived(cluster, data))
      })
      window.electronAPI.on(Channels.Cluster.CheckEngineStatusResult, (cluster: ClusterModel, data: AppModel) => {
        dispatch(DeploymentAction.engineStatusReceived(cluster, data))
      })
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const DeploymentAction = {
  setConfiguring: (cluster: ClusterModel, isConfiguring: boolean) => {
    return {
      type: 'SET_CONFIGURING' as const,
      cluster,
      isConfiguring
    }
  },
  setFetchingStatuses: (cluster: ClusterModel, isFetchingStatuses: boolean) => {
    return {
      type: 'SET_FETCHING_STATUSES' as const,
      cluster,
      isFetchingStatuses
    }
  },
  removeDeployment: (clusterId: string) => {
    return {
      type: 'REMOVE_DEPLOYMENT' as const,
      clusterId
    }
  },
  setDeploymentApps: (cluster: ClusterModel, deploymentApps: DeploymentAppModel) => {
    return {
      type: 'SET_DEPLOYMENT_APPS' as const,
      cluster,
      deploymentApps
    }
  },
  // fetchAppStatus: (cluster: ClusterModel, appsStatus: AppModel[]) => {
  //   return {
  //     type: 'FETCH_APP_STATUS' as const,
  //     cluster,
  //     appsStatus: appsStatus
  //   }
  // },
  systemStatusReceived: (cluster: ClusterModel, systemStatus: AppModel) => {
    return {
      type: 'SYSTEM_STATUS_RECEIVED' as const,
      cluster,
      systemStatus: systemStatus
    }
  },
  appStatusReceived: (cluster: ClusterModel, appStatus: AppModel) => {
    return {
      type: 'APP_STATUS_RECEIVED' as const,
      cluster,
      appStatus: appStatus
    }
  },
  engineStatusReceived: (cluster: ClusterModel, engineStatus: AppModel) => {
    return {
      type: 'ENGINE_STATUS_RECEIVED' as const,
      cluster,
      engineStatus: engineStatus
    }
  }
}

export type DeploymentActionType = ReturnType<typeof DeploymentAction[keyof typeof DeploymentAction]>
