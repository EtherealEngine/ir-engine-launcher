import Routes from 'constants/Routes'
import Storage from 'constants/Storage'
import { SnackbarProvider } from 'notistack'
import * as React from 'react'
import { HashRouter, Navigate, Route, Routes as RouterRoutes } from 'react-router-dom'

import { Box, PaletteMode } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import './App.css'
import HotBar from './common/HotBar'
import NavView from './common/NavView'
import { defaultAction } from './common/NotistackActions'
import MUITheme from './MUITheme'
import AdminPage from './pages/AdminPage'
import ConfigPage from './pages/ConfigPage'
import IPFSPage from './pages/IPFSPage'
import K8DashboardPage from './pages/K8DashboardPage'
import RippledPage from './pages/RippledPage'
import WelcomePage from './pages/WelcomePage'
import { useConfigFileState } from './services/ConfigFileService'
import { SettingsService } from './services/SettingsService'

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

const App = () => {
  const notistackRef = React.createRef<SnackbarProvider>()
  const { selectedCluster } = useConfigFileState().value

  const enableRippleStack = selectedCluster && selectedCluster.configs[Storage.ENABLE_RIPPLE_STACK] === 'true'

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const defaultMode = (prefersDarkMode ? 'dark' : 'light') as PaletteMode
  const storedMode = localStorage.getItem(Storage.COLOR_MODE) as PaletteMode | undefined
  const [mode, setMode] = React.useState(storedMode ? storedMode : defaultMode)
  const theme = React.useMemo(() => createTheme(MUITheme(mode) as any), [mode])
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light'
          const html = document.querySelector('html')
          if (html) {
            html.dataset.theme = newMode
          }
          localStorage.setItem(Storage.COLOR_MODE, newMode)
          return newMode
        })
      }
    }),
    []
  )

  React.useEffect(() => {
    if (notistackRef.current) {
      SettingsService.setNotiStack(notistackRef.current)
    }
  }, [notistackRef])

  React.useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.dataset.theme = mode || 'dark'
    }
  }, [])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          ref={notistackRef}
          maxSnack={5}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          action={defaultAction}
        >
          <HashRouter>
            <NavView />
            <Box display="flex">
              <HotBar />
              <Box width={'calc(100vw - 100px) !important'}>
                <RouterRoutes>
                  <Route path={Routes.ROOT} element={<WelcomePage />} />
                  <Route path={Routes.CONFIG} element={<ConfigPage />} />
                  <Route path={Routes.ADMIN} element={<AdminPage />} />
                  <Route path={Routes.K8DASHBOARD} element={<K8DashboardPage />} />
                  {enableRippleStack && <Route path={Routes.IPFS} element={<IPFSPage />} />}
                  {enableRippleStack && <Route path={Routes.RIPPLED} element={<RippledPage />} />}
                  <Route path="*" element={<Navigate to={Routes.ROOT} replace />} />
                </RouterRoutes>
              </Box>
            </Box>
          </HashRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
