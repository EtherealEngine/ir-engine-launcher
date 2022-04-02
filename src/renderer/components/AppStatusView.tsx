import { AppStatus } from 'models/AppStatus'
import { Fragment, useState } from 'react'
import { useAppStatusState } from 'renderer/services/AppStatusService'

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import { CircularProgress, FormControlLabel, Grid, Switch, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'

const AppStatusView = () => {
  const [showAppStatus, setShowAppStatus] = useState(true)

  const appStatusState = useAppStatusState()
  const { appStatus } = appStatusState.value

  const allAppsConfigured = appStatus.every((app) => app.status === AppStatus.Configured)
  const allAppsNotConfigured = appStatus.every((app) => app.status === AppStatus.NotConfigured)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          Apps Status:
          {allAppsConfigured && (
            <Fragment>
              <CheckCircleOutlineIcon sx={{ marginLeft: 2, marginRight: 1, color: 'limegreen' }} /> All Configured
            </Fragment>
          )}
          {allAppsNotConfigured && (
            <Fragment>
              <CancelOutlinedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'red' }} /> Nothing Configured
            </Fragment>
          )}
          {!allAppsConfigured && !allAppsConfigured && (
            <Fragment>
              <RemoveCircleOutlineRoundedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'orange' }} /> Pending
              Configuration
            </Fragment>
          )}
        </Typography>
        <FormControlLabel
          value={showAppStatus}
          control={<Switch defaultChecked color="primary" />}
          label={showAppStatus ? 'Hide Details' : 'Show Details'}
          labelPlacement="start"
          onChange={(_event, checked) => setShowAppStatus(checked)}
        />
      </Box>
      {showAppStatus && (
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
              {app.status === AppStatus.Configured && <CheckCircleOutlineIcon sx={{ color: 'limegreen' }} />}
              {app.status === AppStatus.NotConfigured && <CancelOutlinedIcon sx={{ color: 'red' }} />}
              {app.status === AppStatus.Pending && <RemoveCircleOutlineRoundedIcon />}

              <Typography marginLeft={1}>{app.name}</Typography>

              {app.detail && (
                <Tooltip
                  title={
                    <Typography
                      variant="body2"
                      color="inherit"
                      sx={{ overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-line' }}
                    >
                      {app.detail}
                    </Typography>
                  }
                  arrow
                >
                  <InfoOutlinedIcon color="primary" sx={{ marginLeft: 2, fontSize: '18px' }} />
                </Tooltip>
              )}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default AppStatusView
