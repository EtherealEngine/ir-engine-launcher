import { ClusterType } from 'models/Cluster'

import Routes from './Routes'

type UI = {
  createCluster: CreateClusterUI
  navViewRoutes: string[]
}

type CreateClusterUI = {
  authenticate?: boolean
  configs?: boolean
  variables?: boolean
  kubeconfig?: boolean
  deployment?: boolean
  showSummaryNotes?: boolean
  showConfigButton?: boolean
}

const UIEnabled = {
  [ClusterType.MicroK8s]: {
    createCluster: {
      authenticate: true,
      configs: true,
      variables: true,
      showSummaryNotes: true,
      showConfigButton: true
    },
    navViewRoutes: [Routes.CONFIG, Routes.WORKLOADS, Routes.ADMIN, Routes.K8DASHBOARD]
  },
  [ClusterType.Minikube]: {
    createCluster: {
      authenticate: true,
      configs: true,
      variables: true,
      showSummaryNotes: true,
      showConfigButton: true
    },
    navViewRoutes: [Routes.CONFIG, Routes.WORKLOADS, Routes.ADMIN, Routes.K8DASHBOARD]
  },
  [ClusterType.Custom]: { createCluster: { kubeconfig: true, deployment: true }, navViewRoutes: [Routes.WORKLOADS] }
} as Record<ClusterType, UI>

export default UIEnabled
