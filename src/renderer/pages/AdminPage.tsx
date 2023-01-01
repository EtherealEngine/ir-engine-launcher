import Endpoints from 'constants/Endpoints'
import { AppStatus } from 'models/AppStatus'
import PageRoot from 'renderer/common/PageRoot'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'
import { useHookedEffect } from 'renderer/services/useHookedEffect'

import { Box } from '@mui/material'

import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

const AdminPage = () => {
  const settingsState = useSettingsState()
  const { adminPanel } = settingsState.value
  const configFileState = useConfigFileState()
  const { selectedCluster } = configFileState.value

  if (!selectedCluster) {
    return <></>
  }

  const deploymentState = useDeploymentState()
  const { appStatus, engineStatus } = deploymentState.deployments.find(
    (item) => item.clusterId.value === selectedCluster.id
  )!.value
  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)
  const allEngineConfigured = engineStatus.every((engine) => engine.status === AppStatus.Configured)
  const allConfigured = allAppsConfigured && allEngineConfigured

  const appChecking = appStatus.find((app) => app.status === AppStatus.Checking)
  const engineChecking = engineStatus.find((engine) => engine.status === AppStatus.Checking)
  const checking = appChecking || engineChecking

  useHookedEffect(() => {
    if (!adminPanel.adminAccess && !adminPanel.loading && !adminPanel.error && allConfigured) {
      SettingsService.fetchAdminPanelAccess()
    }
  }, [deploymentState, settingsState])

  let loadingMessage = ''
  if (checking) {
    loadingMessage = 'Checking Ethereal Engine'
  } else if (adminPanel.loading) {
    loadingMessage = 'Loading Dashboard'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (!allConfigured) {
    errorMessage = 'Ethereal Engine Not Configured'
    errorDetail = 'Please configure Ethereal Engine before trying again.'
    errorRetry = () => DeploymentService.fetchDeploymentStatus(selectedCluster)
  } else if (adminPanel.error) {
    errorMessage = 'Admin Panel Error'
    errorDetail = adminPanel.error
    errorRetry = () => SettingsService.fetchAdminPanelAccess()
  }

  if (loadingMessage) {
    return <LoadingPage title={loadingMessage} />
  } else if (errorMessage) {
    return <ErrorPage error={errorMessage} detail={errorDetail} onRetry={errorRetry} />
  }

  return (
    <PageRoot full>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <iframe height="100%" style={{ border: 0 }} allow="xr-spatial-tracking" src={Endpoints.ADMIN_PORTAL}></iframe>
      </Box>
    </PageRoot>
  )
}

export default AdminPage
