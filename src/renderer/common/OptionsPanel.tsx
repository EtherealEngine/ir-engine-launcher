import Channels from 'constants/Channels'
import Endpoints from 'constants/Endpoints'
import Storage from 'constants/Storage'
import UIEnabled from 'constants/UIEnabled'
import { AppStatus } from 'models/AppStatus'
import { cloneCluster, ClusterType } from 'models/Cluster'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import GitView from 'renderer/components/GitView'
import AlertDialog from 'renderer/dialogs/AlertDialog'
import ConfigurationDialog from 'renderer/dialogs/ConfigurationDialog'
import SettingsDialog from 'renderer/dialogs/SettingsDialog'
import { ConfigFileService, useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, Button, CircularProgress, IconButton, Popover, Stack, Typography } from '@mui/material'

import logoEngine from '../../../assets/icon.svg'
import logoMicrok8s from '../../../assets/icons/microk8s.png'
import logoMinikube from '../../../assets/icons/minikube.png'

const OptionsPanel = () => {
  const { enqueueSnackbar } = useSnackbar()
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  if (!selectedCluster) {
    return <></>
  }

  const onConfigureClicked = () => {
    setConfigDialog(true)
  }

  const onLaunch = async () => {
    try {
      handlePopoverClose()

      setLaunching(true)

      const clonedCluster = cloneCluster(selectedCluster)
      await window.electronAPI.invoke(Channels.Workloads.LaunchClient, clonedCluster)
    } catch (err) {
      enqueueSnackbar(err?.message ? err.message : err, {
        variant: 'error'
      })
    }

    setLaunching(false)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const handleDelete = async () => {
    ConfigFileService.setSelectedClusterId('')
    await ConfigFileService.deleteConfig(selectedClusterId)
  }

  return (
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
        <Typography variant="h5" sx={{ mr: 5 }}>
          {selectedCluster.name}
        </Typography>

        {UIEnabled[selectedCluster.type].optionsPanel.gitStatus && (
          <GitView name="Engine" repoType={Storage.ENGINE_PATH} />
        )}

        {UIEnabled[selectedCluster.type].optionsPanel.gitStatus && (
          <GitView sx={{ ml: 5 }} name="Ops" repoType={Storage.OPS_PATH} />
        )}
      </Box>

      {UIEnabled[selectedCluster.type].optionsPanel.refreshButton && (
        <IconButton
          title="Refresh"
          color="primary"
          disabled={currentDeployment?.isFetchingStatuses}
          onClick={() => DeploymentService.fetchDeploymentStatus(selectedCluster)}
        >
          <CachedOutlinedIcon />
        </IconButton>
      )}

      <IconButton title="Delete Cluster" color="primary" onClick={() => setShowDeleteDialog(true)}>
        <DeleteIcon />
      </IconButton>

      <IconButton title="Settings" color="primary" onClick={() => setSettingsDialog(true)}>
        <SettingsIcon />
      </IconButton>

      {UIEnabled[selectedCluster.type].optionsPanel.configureButton && (
        <LoadingButton
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, var(--buttonGradientStart), var(--buttonGradientEnd))',
            ':hover': { opacity: 0.8 },
            width: 150
          }}
          loading={currentDeployment?.isConfiguring}
          startIcon={currentDeployment?.isConfiguring ? undefined : <PowerSettingsNewOutlinedIcon />}
          loadingIndicator={
            <Box sx={{ display: 'flex', color: 'var(--textColor)' }}>
              <CircularProgress size={24} sx={{ marginRight: 1 }} />
              Configuring
            </Box>
          }
          onClick={onConfigureClicked}
        >
          Configure
        </LoadingButton>
      )}

      <LoadingButton
        variant="outlined"
        disabled={!allConfigured}
        sx={{ width: isLaunching ? 140 : 'auto' }}
        loading={isLaunching}
        startIcon={isLaunching ? undefined : <RocketLaunchOutlinedIcon />}
        loadingIndicator={
          <Box sx={{ display: 'flex', color: 'var(--textColor)' }}>
            <CircularProgress size={24} sx={{ marginRight: 1 }} />
            Launching
          </Box>
        }
        onClick={(event) =>
          selectedCluster.type === ClusterType.MicroK8s || selectedCluster.type === ClusterType.Minikube
            ? setAnchorEl(event.currentTarget)
            : onLaunch()
        }
      >
        Launch
      </LoadingButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            m: 2
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <LocalPoliceIcon sx={{ fontSize: '40px' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
              <Typography>Please make sure to accept certificates in the browser.</Typography>
              <Typography fontSize={14} sx={{ mt: 1 }}>
                <span style={{ fontSize: 14, opacity: 0.6 }}>Reference: </span>
                <a style={{ color: 'var(--textColor)' }} href={Endpoints.Docs.ACCEPT_INVALID_CERTS} target="_blank">
                  accept-invalid-certs
                </a>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={onLaunch}>
              Continue
            </Button>
          </Box>
        </Box>
      </Popover>

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
    </Stack>
  )
}

export default OptionsPanel
