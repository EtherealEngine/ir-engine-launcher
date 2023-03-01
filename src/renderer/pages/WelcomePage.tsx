import PageRoot from 'renderer/common/PageRoot'
import { SettingsService } from 'renderer/services/SettingsService'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Typography } from '@mui/material'

import logo from '../../../assets/icon.svg'

const WelcomePage = () => {
  const content = (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        <Box sx={{ height: 85, mr: 0.7 }} component="img" src={logo} />
        <Typography sx={{ fontSize: 30 }} variant="h6">
          Control Center
        </Typography>
      </Box>

      <Typography sx={{ mb: 4, mt: 2 }}>Please select a cluster from hotbar or create a new one.</Typography>

      <Button
        color="primary"
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ background: 'var(--purplePinkGradient)', ':hover': { opacity: 0.8 } }}
        onClick={() => SettingsService.setCreateClusterDialog(true)}
      >
        Create
      </Button>
    </Box>
  )

  return <PageRoot>{content}</PageRoot>
}

export default WelcomePage
