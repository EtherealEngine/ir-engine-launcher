import Endpoints from 'constants/Endpoints'
import { AppStatus } from 'models/AppStatus'
import { useEffect } from 'react'
import PageRoot from 'renderer/common/PageRoot'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import { Box } from '@mui/material'

import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

const AdminPage = () => {
  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.find((item) => item.clusterId.value === selectedClusterId)?.value

  const allAppsConfigured = currentDeployment?.appStatus.every((app) => app.status === AppStatus.Configured)
  const allEngineConfigured = currentDeployment?.engineStatus.every((engine) => engine.status === AppStatus.Configured)
  const allConfigured = allAppsConfigured && allEngineConfigured

  const appChecking = currentDeployment?.appStatus.find((app) => app.status === AppStatus.Checking)
  const engineChecking = currentDeployment?.engineStatus.find((engine) => engine.status === AppStatus.Checking)
  const checking = appChecking || engineChecking

  useEffect(() => {
    if (
      selectedCluster &&
      !currentDeployment?.adminPanel.data &&
      !currentDeployment?.adminPanel.loading &&
      !currentDeployment?.adminPanel.error &&
      allConfigured
    ) {
      DeploymentService.fetchAdminPanelAccess(selectedCluster)
    }
  }, [])

  if (!selectedCluster) {
    return <></>
  }

  let loadingMessage = ''
  if (checking) {
    loadingMessage = 'Checking Ethereal Engine'
  } else if (currentDeployment?.adminPanel.loading) {
    loadingMessage = 'Loading Dashboard'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (!allConfigured) {
    errorMessage = 'Ethereal Engine Not Configured'
    errorDetail = 'Please configure Ethereal Engine before trying again.'
    errorRetry = () => DeploymentService.fetchDeploymentStatus(selectedCluster)
  } else if (currentDeployment?.adminPanel.error) {
    errorMessage = 'Admin Panel Error'
    errorDetail = currentDeployment?.adminPanel.error
    errorRetry = () => DeploymentService.fetchAdminPanelAccess(selectedCluster)
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
