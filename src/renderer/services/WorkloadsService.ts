import { hookstate, useHookstate } from '@hookstate/core'
import Channels from 'constants/Channels'
import { cloneCluster, ClusterModel } from 'models/Cluster'
import { AdditionalLogType } from 'models/Log'
import { Workloads, WorkloadsPodInfo } from 'models/Workloads'

import { store, useDispatch } from '../store'
import { LogService } from './LogService'
import { accessSettingsState } from './SettingsService'

type WorkloadsState = {
  clusterId: string
  isFetched: boolean
  isLoading: boolean
  workloads: Workloads[]
}

//State
const state = hookstate<WorkloadsState[]>([])

store.receptors.push((action: WorkloadsActionType): void => {
  switch (action.type) {
    case 'FETCH_WORKLOADS': {
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
            workloads: action.workloads
          } as WorkloadsState
        ])
      } else {
        state[index].set({
          clusterId: action.clusterId,
          isFetched: true,
          isLoading: false,
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
    dispatch(WorkloadsAction.setWorkloads(clusterId, []))
  },
  fetchWorkloads: async (cluster: ClusterModel) => {
    // Here we are cloning cluster object so that when selected Cluster is changed,
    // The context cluster does not change.
    const clonedCluster = cloneCluster(cluster)

    const { enqueueSnackbar } = accessSettingsState().value.notistack
    const dispatch = useDispatch()
    try {
      dispatch(WorkloadsAction.fetchWorkloads(clonedCluster.id))

      let workloads: Workloads[] = await window.electronAPI.invoke(Channels.Workloads.FetchWorkloads, clonedCluster)
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

      dispatch(WorkloadsAction.setWorkloads(cluster.id, workloads))
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to fetch Workloads. ${error}`, {
        variant: 'error'
      })
    }
  },
  removePod: async (cluster: ClusterModel, podName: string) => {
    // Here we are cloning cluster object so that when selected Cluster is changed,
    // The context cluster does not change.
    const clonedCluster = cloneCluster(cluster)

    const { enqueueSnackbar } = accessSettingsState().value.notistack
    try {
      await window.electronAPI.invoke(Channels.Workloads.RemovePod, clonedCluster, podName)

      await WorkloadsService.fetchWorkloads(clonedCluster)
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
        id: podName,
        label: podName,
        isLoading: false,
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
  fetchWorkloads: (clusterId: string) => {
    return {
      type: 'FETCH_WORKLOADS' as const,
      clusterId
    }
  },
  setWorkloads: (clusterId: string, workloads: Workloads[]) => {
    return {
      type: 'SET_WORKLOADS' as const,
      clusterId,
      workloads
    }
  }
}

export type WorkloadsActionType = ReturnType<(typeof WorkloadsAction)[keyof typeof WorkloadsAction]>
