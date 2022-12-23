import { Channels } from 'constants/Channels'
import Endpoints from 'constants/Endpoints'
import { AppStatus } from 'models/AppStatus'
import { useState } from 'react'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import 'react-reflex/styles.css'
import ConfigurationDialog from 'renderer/components/ConfigurationDialog'
import LogsView from 'renderer/components/LogsView'
import PageRoot from 'renderer/common/PageRoot'
import SettingsDialog from 'renderer/components/SettingsDialog'
import StatusView from 'renderer/components/StatusView'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, CircularProgress, IconButton, Stack } from '@mui/material'

const ConfigPage = () => {
  const [showConfigDialog, setConfigDialog] = useState(false)
  const [showSettingsDialog, setSettingsDialog] = useState(false)
  const [isLaunching, setLaunching] = useState(false)
  const deploymentState = useDeploymentState()
  const { isConfiguring, isFetchingStatuses, appStatus, engineStatus, systemStatus } = deploymentState.value

  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)
  const allEngineConfigured = engineStatus.every((engine) => engine.status === AppStatus.Configured)
  const allConfigured = allAppsConfigured && allEngineConfigured

  const onConfigureClicked = () => {
    setConfigDialog(true)
  }

  const onLaunch = async () => {
    setLaunching(true)

    await window.electronAPI.invoke(Channels.Utilities.OpenExternal, Endpoints.LAUNCH_PAGE)

    setLaunching(false)
  }

  return (
    <PageRoot>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
          <IconButton
            title="Refresh"
            color="primary"
            disabled={isFetchingStatuses}
            onClick={DeploymentService.fetchDeploymentStatus}
          >
            <CachedOutlinedIcon />
          </IconButton>
          <IconButton title="Settings" color="primary" onClick={() => setSettingsDialog(true)}>
            <SettingsIcon />
          </IconButton>
          <LoadingButton
            variant="contained"
            sx={{ background: 'var(--purplePinkGradient)', ':hover': { opacity: 0.8 }, width: 150 }}
            startIcon={<PowerSettingsNewOutlinedIcon />}
            loading={isConfiguring}
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
            <StatusView title="System" statuses={systemStatus} />

            <StatusView title="Apps" statuses={appStatus} />

            <StatusView title="Engine" statuses={engineStatus} />
          </ReflexElement>

          <ReflexSplitter />

          <ReflexElement minSize={200} flex={0.3} style={{ overflow: 'hidden' }}>
            <LogsView />
          </ReflexElement>
        </ReflexContainer>
      </Box>
      {showConfigDialog && <ConfigurationDialog onClose={() => setConfigDialog(false)} />}
      {showSettingsDialog && <SettingsDialog onClose={() => setSettingsDialog(false)} />}
    </PageRoot>
  )
}

export default ConfigPage
