import Paths from 'constants/Paths'
import * as React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Box, PaletteMode } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import './App.css'
import ConfigView from './views/ConfigView'
import NavView from './views/NavView'

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = React.useState((prefersDarkMode ? 'dark' : 'light') as PaletteMode)
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
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
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
