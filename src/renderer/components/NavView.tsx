import Paths from 'constants/Paths'
import Storage from 'constants/Storage'
import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ColorModeContext } from 'renderer/App'
import { useSettingsState } from 'renderer/services/SettingsService'

import { AccountCircleOutlined } from '@mui/icons-material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
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

const settings = ['Profile', 'Logout']

const NavView = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null)
  const [anchorElUser, setAnchorElUser] = React.useState(null)

  const settingsState = useSettingsState()
  const { configs } = settingsState.value
  const enableRippleStack = configs.data[Storage.ENABLE_RIPPLE_STACK] === 'true'

  const theme = useTheme()
  const colorMode = React.useContext(ColorModeContext)

  const navigate = useNavigate()
  const { pathname } = useLocation()

  let pages = [
    {
      title: 'Config',
      path: Paths.ROOT
    },
    {
      title: 'Admin',
      path: Paths.ADMIN
    },
    {
      title: 'Cluster',
      path: Paths.CLUSTER
    }
  ]

  if (enableRippleStack) {
    pages.push({
      title: 'IPFS',
      path: Paths.IPFS
    })
    pages.push({
      title: 'Rippled CLI',
      path: Paths.RIPPLED
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
      <Box sx={{ height: '70px', backgroundColor: 'var(--dock)' }}>
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
          <Box sx={{ flexGrow: 1, gap: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => {
                  navigate(page.path)
                  handleCloseNavMenu()
                }}
                sx={{ my: 2, color: page.path === pathname ? 'white' : 'gray', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              sx={{ mr: 2 }}
              onClick={() => {
                colorMode.toggleColorMode()
              }}
              color="inherit"
            >
              {theme.palette.mode === 'dark' ? (
                <Brightness7Icon fontSize="small" />
              ) : (
                <Brightness4Icon fontSize="small" />
              )}
            </IconButton>
            <Tooltip title="Profile">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <AccountCircleOutlined sx={{ color: 'white' }} fontSize="large" />
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
