import Paths from 'constants/Paths'
import Storage from 'constants/Storage'
import { SnackbarProvider } from 'notistack'
import * as React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Box, PaletteMode } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import './App.css'
import ConfigView from './pages/ConfigPage'
import NavView from './components/NavView'

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

const App = () => {
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
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <BrowserRouter>
            <NavView />
            <Box
              sx={{
                display: 'flex',
                height: 'calc(100vh - 117px)',
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 3
              }}
            >
              <Routes>
                <Route path={Paths.ROOT} element={<ConfigView />} />
                <Route path={Paths.ADMIN} element={<div>Admin</div>} />
                <Route path={Paths.CLUSTER} element={<div>Cluster</div>} />
                <Route path="*" element={<Navigate to={Paths.ROOT} replace />} />
              </Routes>
            </Box>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
