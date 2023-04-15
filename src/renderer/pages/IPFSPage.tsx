import { AppStatus } from 'models/AppStatus'
import { useEffect } from 'react'
import PageRoot from 'renderer/common/PageRoot'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import { Box } from '@mui/material'

import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

const IPFSPage = () => {
  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.value.find((item) => item.clusterId === selectedClusterId)
  const ipfsStatus = currentDeployment?.appStatus.find((app) => app.id === 'ipfs')

  useEffect(() => {
    if (
      selectedCluster &&
      !currentDeployment?.ipfs.data &&
      !currentDeployment?.ipfs.loading &&
      ipfsStatus?.status === AppStatus.Configured
    ) {
      DeploymentService.fetchIpfsDashboard(selectedCluster)
    } else if (
      selectedCluster &&
      !currentDeployment?.ipfs.data &&
      !currentDeployment?.ipfs.loading &&
      ipfsStatus?.status === AppStatus.NotConfigured
    ) {
      DeploymentService.clearIpfsDashboard(selectedCluster.id)
    }
  }, [])

  if (!selectedCluster) {
    return <></>
  }

  let loadingMessage = ''
  if (ipfsStatus?.status === AppStatus.Checking) {
    loadingMessage = 'Checking IPFS'
  } else if (currentDeployment?.ipfs.loading) {
    loadingMessage = 'Loading Dashboard'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (ipfsStatus?.status === AppStatus.NotConfigured) {
    errorMessage = 'IPFS Not Configured'
    errorDetail = 'Please configure IPFS before trying again.'
    errorRetry = () => DeploymentService.fetchDeploymentStatus(selectedCluster)
  } else if (currentDeployment?.ipfs.error) {
    errorMessage = 'IPFS Dashboard Error'
    errorDetail = currentDeployment?.ipfs.error
    errorRetry = () => DeploymentService.fetchIpfsDashboard(selectedCluster)
  }

  if (loadingMessage) {
    return <LoadingPage title={loadingMessage} />
  } else if (errorMessage) {
    return <ErrorPage error={errorMessage} detail={errorDetail} onRetry={errorRetry} />
  }

  return (
    <PageRoot full>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <webview style={{ border: 0, height: '100%' }} src={currentDeployment?.ipfs.data}></webview>
      </Box>
    </PageRoot>
  )
}

export default IPFSPage
