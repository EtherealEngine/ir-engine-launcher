import { AppStatus } from 'models/AppStatus'
import PageRoot from 'renderer/common/PageRoot'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'
import { useHookedEffect } from 'renderer/services/useHookedEffect'

import { Box } from '@mui/material'

import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

const K8DashboardPage = () => {
  const settingsState = useSettingsState()
  const { k8dashboard } = settingsState.value

  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.deployments.value.find((item) => item.clusterId === selectedClusterId)
  const minikubeStatus = currentDeployment?.appStatus.find((app) => app.id === 'minikube')

  useHookedEffect(() => {
    if (!k8dashboard.url && !k8dashboard.loading && minikubeStatus?.status === AppStatus.Configured) {
      SettingsService.fetchK8Dashboard()
    } else if (!k8dashboard.url && !k8dashboard.loading && minikubeStatus?.status === AppStatus.NotConfigured) {
      SettingsService.clearK8Dashboard()
    }
  }, [deploymentState.deployments])

  if (!selectedCluster) {
    return <></>
  }

  let loadingMessage = ''
  if (minikubeStatus?.status === AppStatus.Checking) {
    loadingMessage = 'Checking Minikube'
  } else if (k8dashboard.loading) {
    loadingMessage = 'Loading Dashboard'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (minikubeStatus?.status === AppStatus.NotConfigured) {
    errorMessage = 'Minikube Not Configured'
    errorDetail = 'Please configure minikube before trying again.'
    errorRetry = () => DeploymentService.fetchDeploymentStatus(selectedCluster)
  } else if (k8dashboard.error) {
    errorMessage = 'Minikube Dashboard Error'
    errorDetail = k8dashboard.error
    errorRetry = () => SettingsService.fetchK8Dashboard()
  }

  if (loadingMessage) {
    return <LoadingPage title={loadingMessage} />
  } else if (errorMessage) {
    return <ErrorPage error={errorMessage} detail={errorDetail} onRetry={errorRetry} />
  }

  return (
    <PageRoot full>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <iframe height="100%" style={{ border: 0 }} src={k8dashboard.url}></iframe>
      </Box>
    </PageRoot>
  )
}

export default K8DashboardPage
