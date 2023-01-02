import { AppStatus } from 'models/AppStatus'
import { useEffect } from 'react'
import PageRoot from 'renderer/common/PageRoot'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import { Box } from '@mui/material'

import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

const K8DashboardPage = () => {
  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.value.find((item) => item.clusterId === selectedClusterId)
  const minikubeStatus = currentDeployment?.appStatus.find((app) => app.id === 'minikube')

  useEffect(() => {
    init()
  }, [])

  const init = () => {
    if (
      selectedCluster &&
      !currentDeployment?.k8dashboard.data &&
      !currentDeployment?.k8dashboard.loading &&
      minikubeStatus?.status === AppStatus.Configured
    ) {
      DeploymentService.fetchK8Dashboard(selectedCluster)
    } else if (
      selectedCluster &&
      !currentDeployment?.k8dashboard.data &&
      !currentDeployment?.k8dashboard.loading &&
      minikubeStatus?.status === AppStatus.NotConfigured
    ) {
      DeploymentService.clearK8Dashboard(selectedCluster.id)
    }
  }

  if (!selectedCluster) {
    return <></>
  }

  let loadingMessage = ''
  if (minikubeStatus?.status === AppStatus.Checking) {
    loadingMessage = 'Checking Minikube'
  } else if (currentDeployment?.k8dashboard.loading) {
    loadingMessage = 'Loading Dashboard'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (minikubeStatus?.status === AppStatus.NotConfigured) {
    errorMessage = 'Minikube Not Configured'
    errorDetail = 'Please configure minikube before trying again.'
    errorRetry = async () => {
      await DeploymentService.fetchDeploymentStatus(selectedCluster)
      init()
    }
  } else if (currentDeployment?.k8dashboard.error) {
    errorMessage = 'Minikube Dashboard Error'
    errorDetail = currentDeployment?.k8dashboard.error
    errorRetry = () => DeploymentService.fetchK8Dashboard(selectedCluster)
  }

  if (loadingMessage) {
    return <LoadingPage title={loadingMessage} />
  } else if (errorMessage) {
    return <ErrorPage error={errorMessage} detail={errorDetail} onRetry={errorRetry} />
  }

  return (
    <PageRoot full>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <iframe height="100%" style={{ border: 0 }} src={currentDeployment?.k8dashboard.data}></iframe>
      </Box>
    </PageRoot>
  )
}

export default K8DashboardPage
