import { ClusterType } from 'models/Cluster'

type UI = {
  createCluster: CreateClusterUI
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
    }
  },
  [ClusterType.Minikube]: {
    createCluster: {
      authenticate: true,
      configs: true,
      variables: true,
      showSummaryNotes: true,
      showConfigButton: true
    }
  },
  [ClusterType.Custom]: { createCluster: { kubeconfig: true, deployment: true } }
} as Record<ClusterType, UI>

export default UIEnabled
