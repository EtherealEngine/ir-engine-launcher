import { Channels } from 'constants/Channels'
import { AppStatus } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import LogsView from 'renderer/components/LogsView'
import PageRoot from 'renderer/components/PageRoot'
import StatusView from 'renderer/components/StatusView'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import { Button, IconButton, Stack } from '@mui/material'
import { Box } from '@mui/system'

const ConfigPage = () => {
  const deploymentState = useDeploymentState()
  const { appStatus, clusterStatus, systemStatus } = deploymentState.value

  const { enqueueSnackbar } = useSnackbar()
  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)
  const allClusterConfigured = clusterStatus.every((cluster) => cluster.status === AppStatus.Configured)
  const allConfigured = allAppsConfigured && allClusterConfigured

  return (
    <PageRoot>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
          <IconButton title="Refresh" color="primary" onClick={DeploymentService.fetchDeploymentStatus}>
            <CachedOutlinedIcon />
          </IconButton>
          <Button
            variant="contained"
            sx={{ background: 'var(--purplePinkGradient)', ':hover': { opacity: 0.8 } }}
            startIcon={<PowerSettingsNewOutlinedIcon />}
            onClick={async () => {
              if (allConfigured) {
                enqueueSnackbar('XREngine already configured successfully', { variant: 'success' })
                return
              }

              const response = await window.electronAPI.invoke(Channels.Shell.ConfigureMinikubeConfig)
              if (response) {
                DeploymentService.fetchDeploymentStatus()
              }
            }}
          >
            Configure
          </Button>
          <Button variant="outlined" startIcon={<DeleteOutlineOutlinedIcon />}>
            Uninstall
          </Button>
        </Stack>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <StatusView title="System" statuses={systemStatus} />

          <StatusView title="Apps" statuses={appStatus} />

          <StatusView title="Cluster" statuses={clusterStatus} />
        </Box>

        <LogsView />
      </Box>
    </PageRoot>
  )
}

export default ConfigPage
