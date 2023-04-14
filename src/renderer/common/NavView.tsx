import Routes from 'constants/Routes'
import Storage from 'constants/Storage'
import { ThemeMode } from 'models/ThemeMode'
import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ColorModeContext } from 'renderer/App'
import { ConfigFileService, useConfigFileState } from 'renderer/services/ConfigFileService'

import { AccountCircleOutlined } from '@mui/icons-material'
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import HomeIcon from '@mui/icons-material/Home'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import logo from '../../../assets/icon.svg'

const settings: string[] = [
  /*'Profile', 'Logout'*/
]

type MenuModel = {
  title: string
  path: string
}

const NavView = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null)
  const [anchorElUser, setAnchorElUser] = React.useState(null)

  const defaultMode = 'vaporwave' as ThemeMode
  const storedMode = localStorage.getItem(Storage.COLOR_MODE) as ThemeMode | undefined
  const [mode, setMode] = React.useState(storedMode ? storedMode : defaultMode)

  const { selectedCluster } = useConfigFileState().value

  const enableRippleStack = selectedCluster && selectedCluster.configs[Storage.ENABLE_RIPPLE_STACK] === 'true'

  const theme = useTheme()
  const colorMode = React.useContext(ColorModeContext)

  const navigate = useNavigate()
  const { pathname } = useLocation()

  let pages: MenuModel[] = []

  if (selectedCluster) {
    pages.push({
      title: 'Config',
      path: Routes.CONFIG
    })
    pages.push({
      title: 'Admin',
      path: Routes.ADMIN
    })
    pages.push({
      title: 'K8 Dashboard',
      path: Routes.K8DASHBOARD
    })
  }

  if (enableRippleStack) {
    pages.push({
      title: 'IPFS',
      path: Routes.IPFS
    })
    pages.push({
      title: 'Rippled CLI',
      path: Routes.RIPPLED
    })
  }

  const handleOpenNavMenu = (event: any) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleOpenUserMenu = (event: any) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  return (
    <AppBar position="static" sx={{ height: '70px', backgroundColor: theme.palette.primary.main }}>
      <Box sx={{ height: '70px', backgroundColor: 'var(--navbarBackground)' }}>
        <Toolbar>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 6, alignItems: 'center', flexDirection: 'row' }}>
            <Box sx={{ height: 45, mr: 0.7 }} component="img" src={logo} />
            <Typography variant="h6">Control Center</Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' }
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={() => {
                    navigate(page.path)
                    handleCloseNavMenu()
                  }}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexDirection: 'row' }}>
            <Box sx={{ height: 45, mr: 0.7 }} component="img" src={logo} />
            <Typography variant="h6">Control Center</Typography>
          </Box>

          <IconButton sx={{ mr: 2 }} color="inherit" onClick={() => ConfigFileService.setSelectedClusterId('')}>
            <HomeIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, gap: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => {
                  navigate(page.path)
                  handleCloseNavMenu()
                }}
                sx={{ my: 2, opacity: page.path === pathname ? 1 : 0.5, display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              title="Toggle Theme"
              sx={{ mr: 2 }}
              onClick={() => {
                const newMode = mode === 'vaporwave' ? 'light' : mode === 'light' ? 'dark' : ('vaporwave' as ThemeMode)
                setMode(newMode)
                colorMode.toggleColorMode()
              }}
              color="inherit"
            >
              {mode === 'vaporwave' ? (
                <Brightness7Icon fontSize="small" />
              ) : mode === 'light' ? (
                <Brightness4Icon fontSize="small" />
              ) : (
                <ColorLensIcon fontSize="small" />
              )}
            </IconButton>
            <Tooltip title="Profile">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <AccountCircleOutlined fontSize="large" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  )
}

export default NavView
