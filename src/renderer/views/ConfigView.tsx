import { Channels } from 'constants/Channels'
import { AppStatus, DefaultApps } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import { Fragment, useEffect, useState } from 'react'

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
  Container,
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
  const [showAppStatus, setShowAppStatus] = useState(true)
  const [showLogs, setShowLogs] = useState(true)
  const [appStatus, setAppStatus] = useState(DefaultApps)
  const { enqueueSnackbar } = useSnackbar()
  const allConfigured = appStatus.every((app) => app.status === AppStatus.Configured)
  const allNotConfigured = appStatus.every((app) => app.status === AppStatus.NotConfigured)

  const checkMinikubeConfig = async () => {
    const response = await window.electronAPI.invoke(Channels.Shell.CheckMinikubeConfig, sudoMode)
    console.log(response)

    setAppStatus(response)
  }

  useEffect(() => {
    const removeEventListener = window.electronAPI.on(Channels.Utilities.Logs, (data: any) => {
      console.log(data)
    })

    return () => {
      removeEventListener()
    }
  }, [])

  useEffect(() => {
    checkMinikubeConfig()
  }, [sudoMode])

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1 }}>
        {/* <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Control Plane Packages
        </Typography>
        <Typography variant="subtitle1">Setup this OS for XREngine K8s Control Plane</Typography>
      </Box> */}

        <Stack direction="row" justifyContent="flex-end" marginBottom={4} spacing={2}>
          <IconButton title="Refresh" color="primary" onClick={() => checkMinikubeConfig()}>
            <CachedOutlinedIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<PowerSettingsNewOutlinedIcon />}
            onClick={async () => {
              if (allConfigured) {
                enqueueSnackbar('XREngine already configured successfully', { variant: 'success' })
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
            {allConfigured && (
              <Fragment>
                <CheckCircleOutlineIcon sx={{ marginLeft: 2, marginRight: 1, color: 'limegreen' }} /> All Configured
              </Fragment>
            )}
            {allNotConfigured && (
              <Fragment>
                <CancelOutlinedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'red' }} /> Nothing Configured
              </Fragment>
            )}
            {!allConfigured && !allConfigured && (
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
        {showLogs && <Box>Coming soon</Box>}
      </Box>
    </Container>
  )
}

export default ConfigView
