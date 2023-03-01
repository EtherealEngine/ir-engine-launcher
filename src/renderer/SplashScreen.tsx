import * as React from 'react'

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Button, CircularProgress, LinearProgress, PaletteMode, Typography } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import logo from '../../assets/icon.svg'
import './App.css'
import PageRoot from './common/PageRoot'
import MUITheme from './MUITheme'
import { UpdatesService, UpdateStatus, useUpdatesState } from './services/UpdatesService'

const SplashScreen = () => {
  const updatesState = useUpdatesState()
  const { status, checking, newVersion, error, progress } = updatesState.value

  const mode = 'dark' as PaletteMode
  const theme = React.useMemo(() => createTheme(MUITheme(mode) as any), [mode])

  React.useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.dataset.theme = mode || 'dark'
    }
  }, [])

  React.useEffect(() => {
    UpdatesService.checkForUpdates()
  }, [])

  let content = (
    <>
      <Typography sx={{ mb: 2 }}>{checking}</Typography>
      <CircularProgress size={40} />
    </>
  )

  if (status === UpdateStatus.Error) {
    content = (
      <>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <CancelOutlinedIcon sx={{ marginRight: 1, color: 'red' }} />
          <Typography>{error}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => UpdatesService.launchApp()}>
          Launch
        </Button>
      </>
    )
  } else if (status === UpdateStatus.Prompt) {
    content = (
      <>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <InfoOutlinedIcon sx={{ marginRight: 1, color: 'white' }} />
          <Typography>New version found: {newVersion}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => UpdatesService.launchApp()}>
            Ignore
          </Button>
          <Button variant="contained" onClick={() => UpdatesService.downloadUpdate()}>
            Update
          </Button>
        </Box>
      </>
    )
  } else if (status === UpdateStatus.Downloading) {
    content = (
      <>
        <Typography sx={{ mb: 2 }}>Downloading the update...</Typography>
        {!progress && <LinearProgress sx={{ width: '100%' }} />}
        {progress && (
          <LinearProgress variant="determinate" value={Math.round(progress.percent)} sx={{ width: '100%' }} />
        )}
        {progress && (
          <>
            <Typography variant="body2" sx={{ mt: 1, color: '#ffffffab' }}>
              {`${Math.round(progress.percent)}% (${humanFileSize(progress.transferred)} of ${humanFileSize(
                progress.total
              )})`}
            </Typography>
            <Typography variant="body2" sx={{ color: '#ffffffab' }}>
              {`${humanFileSize(progress.bytesPerSecond)}/sec`}
            </Typography>
          </>
        )}
      </>
    )
  } else if (status === UpdateStatus.Downloaded) {
    content = (
      <>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <CheckCircleOutlineIcon sx={{ marginRight: 1, color: 'limegreen' }} />
          <Typography>Update successfully downloaded.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => UpdatesService.updateApp()}>
          Quit & Install Now
        </Button>
      </>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <PageRoot noNav full className="splash-screen">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'var(--dock)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mb: 6 }}>
            <Box sx={{ height: 85, mr: 0.7 }} component="img" src={logo} />
            <Typography sx={{ fontSize: 30 }} variant="h6">
              Control Center
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 100
            }}
          >
            {content}
          </Box>
        </Box>
      </PageRoot>
    </ThemeProvider>
  )
}

const humanFileSize = (bytes: number, si: boolean = false) => {
  let thresh = si ? 1000 : 1024
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }
  let units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)
  return bytes.toFixed(2) + ' ' + units[u]
}

export default SplashScreen
