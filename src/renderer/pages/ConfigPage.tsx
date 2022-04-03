import { Channels } from 'constants/Channels'
import { AppStatus } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import AppStatusView from 'renderer/components/AppStatusView'
import ClusterStatusView from 'renderer/components/ClusterStatusView'
import LogsView from 'renderer/components/LogsView'
import { DeploymentStatusService, useDeploymentStatusState } from 'renderer/services/DeploymentStatusService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import { Button, IconButton, Stack } from '@mui/material'
import { Box } from '@mui/system'

const ConfigView = () => {
  const [sudoMode] = useState(false)

  const deploymentStatusState = useDeploymentStatusState()
  const { appStatus } = deploymentStatusState.value

  const { enqueueSnackbar } = useSnackbar()
  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        {/* <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Control Plane Packages
        </Typography>
        <Typography variant="subtitle1">Setup this OS for XREngine K8s Control Plane</Typography>
      </Box> */}

        <Stack sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
          <IconButton
            title="Refresh"
            color="primary"
            onClick={() => {
              DeploymentStatusService.fetchDeploymentStatus(sudoMode)
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
                DeploymentStatusService.fetchDeploymentStatus(sudoMode)
              }
            }}
          >
            Configure
          </Button>
          <Button variant="outlined" disabled startIcon={<DeleteOutlineOutlinedIcon />}>
            Uninstall
          </Button>
        </Stack>
        {/* <FormControlLabel
          value={sudoMode}
          control={<Switch color="primary" />}
          label="Sudo Mode:"
          labelPlacement="start"
          sx={{ textAlign: 'right', display: 'flex' }}
          onChange={(_event, checked) => setSudoMode(checked)}
        /> */}

        <AppStatusView />

        <ClusterStatusView />
      </Box>

      <LogsView />
    </Box>
  )
}

export default ConfigView
