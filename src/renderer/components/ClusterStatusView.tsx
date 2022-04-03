import { useDeploymentStatusState } from 'renderer/services/DeploymentStatusService'

import StatusView from './StatusView'

const ClusterStatusView = () => {
  const deploymentStatusState = useDeploymentStatusState()
  const { clusterStatus } = deploymentStatusState.value

  return <StatusView title="Apps" statuses={clusterStatus} />
}

export default ClusterStatusView
