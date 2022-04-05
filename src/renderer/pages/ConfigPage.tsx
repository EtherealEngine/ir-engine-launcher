import { Channels } from 'constants/Channels'
import { AppStatus } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import LogsView from 'renderer/components/LogsView'
import StatusView from 'renderer/components/StatusView'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'
import { useSettingsState } from 'renderer/services/SettingsService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import { Button, IconButton, Stack } from '@mui/material'
import { Box } from '@mui/system'
import PageRoot from 'renderer/components/PageRoot'

const ConfigPage = () => {
  const settingsState = useSettingsState()
  const { sudoMode } = settingsState.value

  const deploymentState = useDeploymentState()
  const { appStatus, clusterStatus, systemStatus } = deploymentState.value

  const { enqueueSnackbar } = useSnackbar()
  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)

  return (
    <PageRoot>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
          <IconButton
            title="Refresh"
            color="primary"
            onClick={() => {
              DeploymentService.fetchDeploymentStatus(sudoMode)
            }}
          >
            <CachedOutlinedIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<PowerSettingsNewOutlinedIcon />}
            onClick={async () => {
              if (allAppsConfigured) {
                enqueueSnackbar('XREngine Apps already configured successfully', { variant: 'success' })
                return
              }

              const response = await window.electronAPI.invoke(Channels.Shell.ConfigureMinikubeConfig)
              if (response) {
                DeploymentService.fetchDeploymentStatus(sudoMode)
              }
            }}
          >
            Configure
          </Button>
          <Button variant="outlined" disabled startIcon={<DeleteOutlineOutlinedIcon />}>
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
