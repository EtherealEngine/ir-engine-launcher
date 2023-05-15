import { hookstate, useHookstate } from '@hookstate/core'
import Channels from 'constants/Channels'
import { cloneCluster, ClusterModel } from 'models/Cluster'
import { KubeconfigType, KubeContext } from 'models/Kubeconfig'
import { AdditionalLogType } from 'models/Log'
import { Workloads, WorkloadsPodInfo } from 'models/Workloads'

import { store, useDispatch } from '../store'
import { LogService } from './LogService'
import { accessSettingsState } from './SettingsService'

type WorkloadsState = {
  clusterId: string
  isFetched: boolean
  isLoading: boolean
  error: string
  workloads: Workloads[]
}

//State
const state = hookstate<WorkloadsState[]>([])

store.receptors.push((action: WorkloadsActionType): void => {
  switch (action.type) {
    case 'GET_WORKLOADS': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index !== -1) {
        state[index].isLoading.set(true)
      }
      break
    }
    case 'SET_WORKLOADS': {
      const index = state.findIndex((item) => item.clusterId.value === action.clusterId)
      if (index === -1) {
        state.merge([
          {
            clusterId: action.clusterId,
            isFetched: false,
            isLoading: false,
            error: action.error,
            workloads: action.workloads
          } as WorkloadsState
        ])
      } else {
        state[index].set({
          clusterId: action.clusterId,
          isFetched: true,
          isLoading: false,
          error: action.error,
          workloads: action.workloads
        } as WorkloadsState)
      }
      break
    }
  }
})

export const accessWorkloadsState = () => state

export const useWorkloadsState = () => useHookstate(state) as any as typeof state

//Service
export const WorkloadsService = {
  initWorkloads: (clusterId: string) => {
    const dispatch = useDispatch()
    dispatch(WorkloadsAction.setWorkloads(clusterId, [], ''))
  },
  getKubeContexts: async (type: KubeconfigType, typeValue?: string) => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack
    try {
      const contexts: KubeContext[] = await window.electronAPI.invoke(
        Channels.Workloads.GetKubeContexts,
        type,
        typeValue
      )
      return contexts
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to get kube contexts. ${error}`, {
        variant: 'error'
      })
      return []
    }
  },
  getWorkloads: async (cluster: ClusterModel) => {
    // Here we are cloning cluster object so that when selected Cluster is changed,
    // The context cluster does not change.
    const clonedCluster = cloneCluster(cluster)

    const { enqueueSnackbar } = accessSettingsState().value.notistack
    const dispatch = useDispatch()
    try {
      dispatch(WorkloadsAction.getWorkloads(clonedCluster.id))

      let workloads: Workloads[] = await window.electronAPI.invoke(Channels.Workloads.GetWorkloads, clonedCluster)
      const allPods: WorkloadsPodInfo[] = []
      for (const item of workloads) {
        allPods.push(...item.pods)
      }

      workloads = [
        {
          id: 'all',
          label: 'All',
          pods: allPods
        },
        ...workloads
      ]

      dispatch(WorkloadsAction.setWorkloads(cluster.id, workloads, ''))
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to get Workloads. ${error}`, {
        variant: 'error'
      })
      dispatch(WorkloadsAction.setWorkloads(cluster.id, [], error.message))
    }
  },
  checkReleaseName: async (releaseName: string, currentContext: string, type: KubeconfigType, typeValue?: string) => {
    const { enqueueSnackbar } = accessSettingsState().value.notistack
    try {
      const contexts: KubeContext[] = await window.electronAPI.invoke(
        Channels.Workloads.CheckReleaseName,
        releaseName,
        currentContext,
        type,
        typeValue
      )
      return contexts
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to check release name. ${error}`, {
        variant: 'error'
      })
      throw error
    }
  },
  removePod: async (cluster: ClusterModel, podName: string) => {
    // Here we are cloning cluster object so that when selected Cluster is changed,
    // The context cluster does not change.
    const clonedCluster = cloneCluster(cluster)

    const { enqueueSnackbar } = accessSettingsState().value.notistack
    try {
      await window.electronAPI.invoke(Channels.Workloads.RemovePod, clonedCluster, podName)

      await WorkloadsService.getWorkloads(clonedCluster)
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to remove workload pod ${podName}. ${error}`, {
        variant: 'error'
      })
    }
  },
  getPodLogs: async (cluster: ClusterModel, podName: string, containerName: string) => {
    // Here we are cloning cluster object so that when selected Cluster is changed,
    // The context cluster does not change.
    const clonedCluster = cloneCluster(cluster)

    const { enqueueSnackbar } = accessSettingsState().value.notistack
    try {
      const logs = await window.electronAPI.invoke(Channels.Workloads.GetPodLogs, clonedCluster, podName, containerName)
      LogService.setAdditionalLogs(cluster.id, {
        id: `${podName}/${containerName}`,
        label: podName,
        type: AdditionalLogType.Workload,
        logs: [
          {
            date: new Date().toString(),
            category: `${podName} Logs`,
            message: logs
          }
        ]
      })
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to get workload pod logs ${podName}. ${error}`, {
        variant: 'error'
      })
    }
  }
}

//Action
export const WorkloadsAction = {
  getWorkloads: (clusterId: string) => {
    return {
      type: 'GET_WORKLOADS' as const,
      clusterId
    }
  },
  setWorkloads: (clusterId: string, workloads: Workloads[], error: string) => {
    return {
      type: 'SET_WORKLOADS' as const,
      clusterId,
      workloads,
      error
    }
  }
}

export type WorkloadsActionType = ReturnType<(typeof WorkloadsAction)[keyof typeof WorkloadsAction]>
