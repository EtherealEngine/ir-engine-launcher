import Paths from 'constants/Paths'
import Storage from 'constants/Storage'
import { SnackbarProvider } from 'notistack'
import * as React from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Box, PaletteMode } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import './App.css'
import HotBar from './common/HotBar'
import NavView from './common/NavView'
import { defaultAction } from './common/NotistackActions'
import MUITheme from './MUITheme'
import AdminPage from './pages/AdminPage'
import ClusterPage from './pages/ClusterPage'
import ConfigPage from './pages/ConfigPage'
import IPFSPage from './pages/IPFSPage'
import RippledPage from './pages/RippledPage'
import WelcomePage from './pages/WelcomePage'
import { SettingsService, useSettingsState } from './services/SettingsService'

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

const App = () => {
  const notistackRef = React.createRef<SnackbarProvider>()
  const settingsState = useSettingsState()
  const { configs } = settingsState.value
  const enableRippleStack = configs.data[Storage.ENABLE_RIPPLE_STACK] === 'true'

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
                <Routes>
                  <Route path={Paths.ROOT} element={<WelcomePage />} />
                  <Route path={Paths.CONFIG} element={<ConfigPage />} />
                  <Route path={Paths.ADMIN} element={<AdminPage />} />
                  <Route path={Paths.CLUSTER} element={<ClusterPage />} />
                  {enableRippleStack && <Route path={Paths.IPFS} element={<IPFSPage />} />}
                  {enableRippleStack && <Route path={Paths.RIPPLED} element={<RippledPage />} />}
                  <Route path="*" element={<Navigate to={Paths.ROOT} replace />} />
                </Routes>
              </Box>
            </Box>
          </HashRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
