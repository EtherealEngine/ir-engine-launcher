import Paths from 'constants/Paths'
import Storage from 'constants/Storage'
import { SnackbarProvider } from 'notistack'
import * as React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import CloseIcon from '@mui/icons-material/Close'
import { IconButton, PaletteMode } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import './App.css'
import NavView from './components/NavView'
import AdminPage from './pages/AdminPage'
import ClusterPage from './pages/ClusterPage'
import ConfigPage from './pages/ConfigPage'

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

const App = () => {
  const notistackRef = React.createRef<SnackbarProvider>()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const defaultMode = (prefersDarkMode ? 'dark' : 'light') as PaletteMode
  const storedMode = localStorage.getItem(Storage.COLOR_MODE) as PaletteMode | undefined
  const [mode, setMode] = React.useState(storedMode ? storedMode : defaultMode)
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light'
          localStorage.setItem(Storage.COLOR_MODE, newMode)
          return newMode
        })
      }
    }),
    []
  )

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode
        }
      }),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          ref={notistackRef}
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          action={(key) => (
            <IconButton onClick={() => notistackRef.current?.closeSnackbar(key)}>
              <CloseIcon />
            </IconButton>
          )}
        >
          <BrowserRouter>
            <NavView />
            <Routes>
              <Route path={Paths.ROOT} element={<ConfigPage />} />
              <Route path={Paths.ADMIN} element={<AdminPage />} />
              <Route path={Paths.CLUSTER} element={<ClusterPage />} />
              <Route path="*" element={<Navigate to={Paths.ROOT} replace />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
