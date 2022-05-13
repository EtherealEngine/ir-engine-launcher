import { AppStatus } from 'models/AppStatus'
import PageRoot from 'renderer/components/PageRoot'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'
import { useHookedEffect } from 'renderer/services/useHookedEffect'

import { Box } from '@mui/material'

import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

const IPFSPage = () => {
  const settingsState = useSettingsState()
  const { ipfs } = settingsState.value

  const deploymentState = useDeploymentState()
  const { appStatus } = deploymentState.value
  const ipfsStatus = appStatus.find((app) => app.id === 'ipfs')

  useHookedEffect(() => {
    if (!ipfs.url && !ipfs.loading && ipfsStatus?.status === AppStatus.Configured) {
      SettingsService.fetchIpfsDashboard()
    } else if (!ipfs.url && !ipfs.loading && ipfsStatus?.status === AppStatus.NotConfigured) {
      SettingsService.clearIpfsDashboard()
    }
  }, [deploymentState.appStatus])

  let loadingMessage = ''
  if (ipfsStatus?.status === AppStatus.Checking) {
    loadingMessage = 'Checking IPFS'
  } else if (ipfs.loading) {
    loadingMessage = 'Loading Dashboard'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (ipfsStatus?.status === AppStatus.NotConfigured) {
    errorMessage = 'IPFS Not Configured'
    errorDetail = 'Please configure IPFS before trying again.'
    errorRetry = () => DeploymentService.fetchDeploymentStatus()
  } else if (ipfs.error) {
    errorMessage = 'IPFS Dashboard Error'
    errorDetail = ipfs.error
    errorRetry = () => SettingsService.fetchIpfsDashboard()
  }

  if (loadingMessage) {
    return <LoadingPage title={loadingMessage} />
  } else if (errorMessage) {
    return <ErrorPage error={errorMessage} detail={errorDetail} onRetry={errorRetry} />
  }

  return (
    <PageRoot full>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <iframe height="100%" style={{ border: 0 }} src={ipfs.url}></iframe>
      </Box>
    </PageRoot>
  )
}

export default IPFSPage
