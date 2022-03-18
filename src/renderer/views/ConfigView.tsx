import { Channels } from 'constants/Channels'
import { AppStatus } from 'models/AppStatus'
import { useEffect, useState } from 'react'

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import { CircularProgress, Container, Grid, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'

const DefaultAppStatus = [
  {
    id: 'node',
    name: 'Node',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'npm',
    name: 'npm',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'git',
    name: 'Git',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'docker',
    name: 'Docker',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'dockercompose',
    name: 'Docker Compose',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'mysql',
    name: 'MySql',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'virtualbox',
    name: 'VirtualBox',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'kubectl',
    name: 'kubectl',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'helm',
    name: 'Helm',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'minikube',
    name: 'Minikube',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'redis',
    name: 'Redis',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'ingress',
    name: 'Ingress',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'xrengine',
    name: 'XREngine',
    detail: '',
    status: AppStatus.Checking
  }
]

const ConfigView = () => {
  const [sudoMode, setSudoMode] = useState(false)
  const [appStatus, setAppStatus] = useState(DefaultAppStatus)

  useEffect(() => {
    const checkMinikubeConfig = async () => {
      const response = await window.electronAPI.invoke(Channels.Shell.CheckMinikubeConfig, sudoMode)
      console.log(response)

      setAppStatus(response)
    }

    checkMinikubeConfig()
  }, [sudoMode])

  return (
    <Container sx={{ textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Control Plane Packages
      </Typography>
      <Typography variant="subtitle1">Setup this OS for XREngine K8s Control Plane</Typography>

      <Box sx={{ textAlign: 'left' }}>
        {/* <FormControlLabel
          value={sudoMode}
          control={<Switch color="primary" />}
          label="Sudo Mode:"
          labelPlacement="start"
          sx={{ textAlign: 'right', display: 'flex' }}
          onChange={(_event, checked) => setSudoMode(checked)}
        /> */}
        <Typography variant="subtitle1" marginBottom={2}>
          Status:
        </Typography>
        <Grid container>
          {appStatus.map((app) => (
            <Grid
              item
              key={app.id}
              xs={12}
              md={3}
              sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}
            >
              {app.status === AppStatus.Checking && <CircularProgress size={20} />}
              {app.status === AppStatus.Installed && <CheckCircleOutlineIcon sx={{ color: 'limegreen' }} />}
              {app.status === AppStatus.NotInstalled && <CancelOutlinedIcon sx={{ color: 'red' }} />}
              {app.status === AppStatus.Pending && <RemoveCircleOutlineRoundedIcon />}

              <Typography marginLeft={1}>{app.name}</Typography>

              {app.detail && (
                <Tooltip title={app.detail} arrow>
                  <InfoOutlinedIcon color="primary" fontSize="18px" sx={{ marginLeft: 2 }} />
                </Tooltip>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}

export default ConfigView
