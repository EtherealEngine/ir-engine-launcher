import { Channels } from 'constants/Channels'
import { AppModel, AppStatus, DefaultApps, DefaultDeployments } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import { Fragment, useEffect, useRef, useState } from 'react'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography
} from '@mui/material'
import { Box } from '@mui/system'

const ConfigView = () => {
  const [sudoMode] = useState(false)
  const [showLogs, setShowLogs] = useState(true)
  const [showAppStatus, setShowAppStatus] = useState(true)
  const [appStatus, setAppStatus] = useState(DefaultApps)
  const [logs, setLogs] = useState<string[]>([])
  const [showDeploymentStatus, setShowDeploymentStatus] = useState(true)
  const [deploymentStatus, setDeploymentStatus] = useState(DefaultDeployments)
  const logsEndRef = useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)
  const allAppsNotConfigured = appStatus.every((app) => app.status === AppStatus.NotConfigured)
  const allDeploymentsConfigured = deploymentStatus.every((app) => app.status === AppStatus.Configured)
  const allDeploymentsNotConfigured = deploymentStatus.every((app) => app.status === AppStatus.NotConfigured)

  const checkMinikubeConfig = () => {
    window.electronAPI.invoke(Channels.Shell.CheckMinikubeConfig, sudoMode)
  }

  useEffect(() => {
    const removeEventListener = window.electronAPI.on(Channels.Shell.CheckMinikubeConfigResult, (data: AppModel) => {
      const apps = [...appStatus]

      let index = apps.findIndex((app) => app.id === data.id)
      if (index !== -1) {
        apps[index] = data
      }

      setAppStatus(apps)
    })

    return () => {
      removeEventListener()
    }
  }, [appStatus])

  const scrollLogsToBottom = () => {
    ;(logsEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const removeEventListener = window.electronAPI.on(Channels.Utilities.Logs, (data: string) => {
      setLogs([...logs, data])
    })

    return () => {
      removeEventListener()
    }
  }, [logs])

  // Scroll to bottom of logs
  useEffect(() => {
    scrollLogsToBottom()
  }, [logs, showLogs])

  useEffect(() => {
    checkMinikubeConfig()
  }, [sudoMode])

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
              setAppStatus(DefaultApps)
              checkMinikubeConfig()
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
                checkMinikubeConfig()
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
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            Apps Status:
            {allAppsConfigured && (
              <Fragment>
                <CheckCircleOutlineIcon sx={{ marginLeft: 2, marginRight: 1, color: 'limegreen' }} /> All Configured
              </Fragment>
            )}
            {allAppsNotConfigured && (
              <Fragment>
                <CancelOutlinedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'red' }} /> Nothing Configured
              </Fragment>
            )}
            {!allAppsConfigured && !allAppsConfigured && (
              <Fragment>
                <RemoveCircleOutlineRoundedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'orange' }} /> Pending
                Configuration
              </Fragment>
            )}
          </Typography>
          <FormControlLabel
            value={showAppStatus}
            control={<Switch defaultChecked color="primary" />}
            label={showAppStatus ? 'Hide Details' : 'Show Details'}
            labelPlacement="start"
            onChange={(_event, checked) => setShowAppStatus(checked)}
          />
        </Box>
        {showAppStatus && (
          <Grid container>
            {appStatus.map((app) => (
              <Grid
                item
                key={app.id}
                xs={12}
                md={3}
                sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}
              >
                {app.status === AppStatus.Checking && <CircularProgress size={20} />}
                {app.status === AppStatus.Configured && <CheckCircleOutlineIcon sx={{ color: 'limegreen' }} />}
                {app.status === AppStatus.NotConfigured && <CancelOutlinedIcon sx={{ color: 'red' }} />}
                {app.status === AppStatus.Pending && <RemoveCircleOutlineRoundedIcon />}

                <Typography marginLeft={1}>{app.name}</Typography>

                {app.detail && (
                  <Tooltip
                    title={
                      <Typography
                        variant="body2"
                        color="inherit"
                        sx={{ overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-line' }}
                      >
                        {app.detail}
                      </Typography>
                    }
                    arrow
                  >
                    <InfoOutlinedIcon color="primary" sx={{ marginLeft: 2, fontSize: '18px' }} />
                  </Tooltip>
                )}
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2, marginTop: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            Deployment Status:
            {allDeploymentsConfigured && (
              <Fragment>
                <CheckCircleOutlineIcon sx={{ marginLeft: 2, marginRight: 1, color: 'limegreen' }} /> All Configured
              </Fragment>
            )}
            {allDeploymentsNotConfigured && (
              <Fragment>
                <CancelOutlinedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'red' }} /> Nothing Configured
              </Fragment>
            )}
            {!allDeploymentsConfigured && !allDeploymentsNotConfigured && (
              <Fragment>
                <RemoveCircleOutlineRoundedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'orange' }} /> Pending
                Configuration
              </Fragment>
            )}
          </Typography>
          <FormControlLabel
            value={showDeploymentStatus}
            control={<Switch defaultChecked color="primary" />}
            label={showDeploymentStatus ? 'Hide Details' : 'Show Details'}
            labelPlacement="start"
            onChange={(_event, checked) => setShowDeploymentStatus(checked)}
          />
        </Box>
        {showDeploymentStatus && (
          <Grid container>
            {deploymentStatus.map((deploy) => (
              <Grid
                item
                key={deploy.id}
                xs={12}
                md={3}
                sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}
              >
                {deploy.status === AppStatus.Checking && <CircularProgress size={20} />}
                {deploy.status === AppStatus.Configured && <CheckCircleOutlineIcon sx={{ color: 'limegreen' }} />}
                {deploy.status === AppStatus.NotConfigured && <CancelOutlinedIcon sx={{ color: 'red' }} />}
                {deploy.status === AppStatus.Pending && <RemoveCircleOutlineRoundedIcon />}

                <Typography marginLeft={1}>{deploy.name}</Typography>

                {deploy.detail && (
                  <Tooltip
                    title={
                      <Typography
                        variant="body2"
                        color="inherit"
                        sx={{ overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-line' }}
                      >
                        {deploy.detail}
                      </Typography>
                    }
                    arrow
                  >
                    <InfoOutlinedIcon color="primary" sx={{ marginLeft: 2, fontSize: '18px' }} />
                  </Tooltip>
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 2 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex' }}>
            Logs
          </Typography>
          <FormControlLabel
            value={showLogs}
            control={<Switch defaultChecked color="primary" />}
            label={showLogs ? 'Hide Logs' : 'Show Logs'}
            labelPlacement="start"
            onChange={(_event, checked) => setShowLogs(checked)}
          />
        </Box>
        {showLogs && (
          <Box sx={{ overflow: 'auto', height: '30vh' }}>
            {logs.map((log) => (
              <pre>
                {new Date().toLocaleTimeString()}: {log}
              </pre>
            ))}
            <pre ref={logsEndRef} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ConfigView
