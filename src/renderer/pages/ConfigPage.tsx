import { Channels } from 'constants/Channels'
import Endpoints from 'constants/Endpoints'
import { AppStatus } from 'models/AppStatus'
import { ClusterType } from 'models/Cluster'
import { useState } from 'react'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import 'react-reflex/styles.css'
import AlertDialog from 'renderer/common/AlertDialog'
import PageRoot from 'renderer/common/PageRoot'
import ConfigurationDialog from 'renderer/components/ConfigurationDialog'
import GitView from 'renderer/components/GitView'
import LogsView from 'renderer/components/LogsView'
import SettingsDialog from 'renderer/components/SettingsDialog'
import StatusView from 'renderer/components/StatusView'
import { ConfigFileService, useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material'

import logoEngine from '../../../assets/icon.svg'
import logoMicrok8s from '../../../assets/icons/microk8s.png'
import logoMinikube from '../../../assets/icons/minikube.png'

const ConfigPage = () => {
  const [showConfigDialog, setConfigDialog] = useState(false)
  const [showSettingsDialog, setSettingsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLaunching, setLaunching] = useState(false)

  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.value.find((item) => item.clusterId === selectedClusterId)

  const allAppsConfigured = currentDeployment?.appStatus.every((app) => app.status === AppStatus.Configured)
  const allEngineConfigured = currentDeployment?.engineStatus.every((engine) => engine.status === AppStatus.Configured)
  const allConfigured = allAppsConfigured && allEngineConfigured

  const onConfigureClicked = () => {
    setConfigDialog(true)
  }

  const onLaunch = async () => {
    setLaunching(true)

    await window.electronAPI.invoke(Channels.Utilities.OpenExternal, Endpoints.Urls.LAUNCH_PAGE)

    setLaunching(false)
  }

  const handleDelete = async () => {
    ConfigFileService.setSelectedClusterId('')
    await ConfigFileService.deleteConfig(selectedClusterId)
  }

  if (!selectedCluster) {
    return <></>
  }

  return (
    <PageRoot>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Stack sx={{ flexDirection: 'row', gap: 2, marginBottom: 3 }}>
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: 1 }}>
            <Box
              sx={{ width: 35 }}
              component="img"
              title={`${selectedCluster.name} (${
                selectedCluster.type === ClusterType.Minikube
                  ? 'Minikube'
                  : selectedCluster.type === ClusterType.MicroK8s
                  ? 'MicroK8s'
                  : 'Undefined'
              })`}
              src={
                selectedCluster.type === ClusterType.Minikube
                  ? logoMinikube
                  : selectedCluster.type === ClusterType.MicroK8s
                  ? logoMicrok8s
                  : logoEngine
              }
            />
            <Typography variant="h5" sx={{ mr: 3 }}>
              {selectedCluster.name}
            </Typography>

            <GitView />
          </Box>

          <IconButton
            title="Refresh"
            color="primary"
            disabled={currentDeployment?.isFetchingStatuses}
            onClick={() => DeploymentService.fetchDeploymentStatus(selectedCluster)}
          >
            <CachedOutlinedIcon />
          </IconButton>

          <IconButton title="Delete Cluster" color="primary" onClick={() => setShowDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>

          <IconButton title="Settings" color="primary" onClick={() => setSettingsDialog(true)}>
            <SettingsIcon />
          </IconButton>

          <LoadingButton
            variant="contained"
            sx={{ background: 'var(--purplePinkGradient)', ':hover': { opacity: 0.8 }, width: 150 }}
            startIcon={<PowerSettingsNewOutlinedIcon />}
            loading={currentDeployment?.isConfiguring}
            loadingIndicator={
              <Box sx={{ display: 'flex', color: '#ffffffab' }}>
                <CircularProgress color="inherit" size={24} sx={{ marginRight: 1 }} />
                Configuring
              </Box>
            }
            onClick={onConfigureClicked}
          >
            Configure
          </LoadingButton>

          <LoadingButton
            variant="outlined"
            disabled={!allConfigured}
            startIcon={<RocketLaunchOutlinedIcon />}
            sx={{ width: isLaunching ? 140 : 'auto' }}
            loading={isLaunching}
            loadingIndicator={
              <Box sx={{ display: 'flex', color: '#ffffffab' }}>
                <CircularProgress color="inherit" size={24} sx={{ marginRight: 1 }} />
                Launching
              </Box>
            }
            onClick={onLaunch}
          >
            Launch
          </LoadingButton>
        </Stack>

        <ReflexContainer orientation="horizontal">
          <ReflexElement minSize={200} flex={0.7} style={{ overflowX: 'hidden' }}>
            <StatusView title="System" statuses={currentDeployment?.systemStatus!} />

            <StatusView title="Apps" statuses={currentDeployment?.appStatus!} />

            <StatusView title="Engine" statuses={currentDeployment?.engineStatus!} />
          </ReflexElement>

          <ReflexSplitter />

          <ReflexElement minSize={200} flex={0.3} style={{ overflow: 'hidden' }}>
            <LogsView />
          </ReflexElement>
        </ReflexContainer>
      </Box>

      {showConfigDialog && <ConfigurationDialog onClose={() => setConfigDialog(false)} />}

      {showSettingsDialog && <SettingsDialog onClose={() => setSettingsDialog(false)} />}

      {showDeleteDialog && (
        <AlertDialog
          title="Confirmation"
          message={
            <>
              <Typography>
                Are you sure you want to delete '{selectedCluster.name}' cluster and all configurations associated with
                it?
              </Typography>
              <Typography sx={{ mt: 2, fontWeight: 300 }}>
                <span style={{ color: 'red' }}>Note: This is an irreversible action.</span>
              </Typography>
            </>
          }
          okButtonText="Delete"
          onClose={() => setShowDeleteDialog(false)}
          onOk={handleDelete}
        />
      )}
    </PageRoot>
  )
}

export default ConfigPage
