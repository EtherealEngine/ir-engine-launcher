import { AppStatus } from 'models/AppStatus'
import ErrorView from 'renderer/components/ErrorView'
import LoadingView from 'renderer/components/LoadingView'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'
import { useHookedEffect } from 'renderer/services/useHookedEffect'

import { Box } from '@mui/system'

const ClusterPage = () => {
  const settingsState = useSettingsState()
  const { sudoMode, cluster } = settingsState.value

  const deploymentState = useDeploymentState()
  const { appStatus } = deploymentState.value
  const minikubeStatus = appStatus.find((app) => app.id === 'minikube')

  useHookedEffect(() => {
    if (!cluster.url && !cluster.loading && minikubeStatus?.status === AppStatus.Configured) {
      SettingsService.fetchClusterDashboard()
    } else if (!cluster.url && !cluster.loading && minikubeStatus?.status === AppStatus.NotConfigured) {
      SettingsService.clearClusterDashboard()
    }
  }, [deploymentState.appStatus])

  let loadingMessage = ''
  if (minikubeStatus?.status === AppStatus.Checking) {
    loadingMessage = 'Checking Minikube'
  } else if (cluster.loading) {
    loadingMessage = 'Loading Dashboard'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (minikubeStatus?.status === AppStatus.NotConfigured) {
    errorMessage = 'Minikube Not Configured'
    errorDetail = 'Please configure minikube before trying again.'
    errorRetry = () => DeploymentService.fetchDeploymentStatus(sudoMode)
  } else if (cluster.error) {
    errorMessage = 'Minikube Dashboard Error'
    errorDetail = cluster.error
    errorRetry = () => SettingsService.fetchClusterDashboard()
  }

  if (loadingMessage) {
    return <LoadingView title={loadingMessage} />
  } else if (errorMessage) {
    return <ErrorView error={errorMessage} detail={errorDetail} onRetry={errorRetry} />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 69px)',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <iframe height="100%" src={cluster.url}></iframe>
      </Box>
    </Box>
  )
}

export default ClusterPage
