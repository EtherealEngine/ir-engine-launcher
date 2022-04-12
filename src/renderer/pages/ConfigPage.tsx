import { Channels } from 'constants/Channels'
import { AppStatus } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import 'react-reflex/styles.css'
import LogsView from 'renderer/components/LogsView'
import PageRoot from 'renderer/components/PageRoot'
import StatusView from 'renderer/components/StatusView'
import SudoPasswordDialog from 'renderer/components/SudoPasswordDialog'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import { Button, IconButton, Stack } from '@mui/material'
import { Box } from '@mui/system'

const ConfigPage = () => {
  const [showPasswordDialog, setPasswordDialog] = useState(false)
  const deploymentState = useDeploymentState()
  const { appStatus, clusterStatus, systemStatus } = deploymentState.value

  const { enqueueSnackbar } = useSnackbar()
  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)
  const allClusterConfigured = clusterStatus.every((cluster) => cluster.status === AppStatus.Configured)
  const allConfigured = allAppsConfigured && allClusterConfigured

  const configureMinikube = async (checkPassword: boolean) => {
    if (allConfigured) {
      enqueueSnackbar('XREngine already configured successfully', { variant: 'success' })
      return
    }

    if (checkPassword) {
      const sudoLoggedIn = await window.electronAPI.invoke(Channels.Shell.CheckSudoPassword)
      if (sudoLoggedIn === false) {
        setPasswordDialog(true)
      }
    }

    const response = await window.electronAPI.invoke(Channels.Shell.ConfigureMinikubeConfig)
    if (response) {
      DeploymentService.fetchDeploymentStatus()
    } else if (checkPassword == false) {
      enqueueSnackbar('Failed to configure XREngine. Please check logs.', {
        variant: 'error'
      })
    }
  }

  return (
    <PageRoot>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
          <IconButton title="Refresh" color="primary" onClick={DeploymentService.fetchDeploymentStatus}>
            <CachedOutlinedIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<PowerSettingsNewOutlinedIcon />}
            onClick={() => configureMinikube(true)}
          >
            Configure
          </Button>
          <Button variant="outlined" disabled startIcon={<DeleteOutlineOutlinedIcon />}>
            Uninstall
          </Button>
        </Stack>
        <ReflexContainer orientation="horizontal">
          <ReflexElement minSize={200} flex={0.7} style={{ overflowX: 'hidden' }}>
            <StatusView title="System" statuses={systemStatus} />

            <StatusView title="Apps" statuses={appStatus} />

            <StatusView title="Cluster" statuses={clusterStatus} />
          </ReflexElement>

          <ReflexSplitter />

          <ReflexElement minSize={200} flex={0.3} style={{ overflow: 'hidden' }}>
            <LogsView />
          </ReflexElement>
        </ReflexContainer>
      </Box>
      {showPasswordDialog && (
        <SudoPasswordDialog
          onClose={(result) => {
            setPasswordDialog(false)

            if (result) {
              configureMinikube(false)
            }
          }}
        />
      )}
    </PageRoot>
  )
}

export default ConfigPage
