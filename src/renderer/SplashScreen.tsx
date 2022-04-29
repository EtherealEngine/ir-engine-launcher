import * as React from 'react'

import { Box, CircularProgress, PaletteMode, Typography } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import logo from '../../assets/icon.svg'
import './App.css'
import PageRoot from './components/PageRoot'
import MUITheme from './MUITheme'
import { UpdatesService } from './services/UpdatesService'

const SplashScreen = () => {
  const mode = 'dark' as PaletteMode

  React.useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.dataset.theme = mode || 'dark'
    }
  }, [])

  React.useEffect(() => {
    UpdatesService.checkForUpdates()
  }, [])

  const theme = React.useMemo(() => createTheme(MUITheme(mode) as any), [mode])

  return (
    <ThemeProvider theme={theme}>
      <PageRoot noNav full>
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
          <Typography sx={{ mb: 2 }}>Checking for updates...</Typography>
          <CircularProgress size={40} />
        </Box>
      </PageRoot>
    </ThemeProvider>
  )
}

export default SplashScreen
