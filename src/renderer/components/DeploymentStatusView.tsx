import { AppStatus, DefaultDeployments } from 'models/AppStatus'
import { Fragment, useState } from 'react'

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import { CircularProgress, FormControlLabel, Grid, Switch, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'

const DeploymentStatusView = () => {
  const [showDeploymentStatus, setShowDeploymentStatus] = useState(true)
  const [deploymentStatus] = useState(DefaultDeployments)
  const allDeploymentsConfigured = deploymentStatus.every((app) => app.status === AppStatus.Configured)
  const allDeploymentsNotConfigured = deploymentStatus.every((app) => app.status === AppStatus.NotConfigured)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2, marginTop: 3 }}>
        <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          Deployment Status:
          {allDeploymentsConfigured && (
            <Fragment>
              <CheckCircleOutlineIcon sx={{ marginLeft: 2, marginRight: 1, color: 'limegreen' }} /> All Configured
            </Fragment>
          )}
          {allDeploymentsNotConfigured && (
            <Fragment>
              <CancelOutlinedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'red' }} /> Nothing Configured
            </Fragment>
          )}
          {!allDeploymentsConfigured && !allDeploymentsNotConfigured && (
            <Fragment>
              <RemoveCircleOutlineRoundedIcon sx={{ marginLeft: 2, marginRight: 1, color: 'orange' }} /> Pending
              Configuration
            </Fragment>
          )}
        </Typography>
        <FormControlLabel
          value={showDeploymentStatus}
          control={<Switch defaultChecked color="primary" />}
          label={showDeploymentStatus ? 'Hide Details' : 'Show Details'}
          labelPlacement="start"
          onChange={(_event, checked) => setShowDeploymentStatus(checked)}
        />
      </Box>
      {showDeploymentStatus && (
        <Grid container>
          {deploymentStatus.map((deploy) => (
            <Grid
              item
              key={deploy.id}
              xs={12}
              md={3}
              sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}
            >
              {deploy.status === AppStatus.Checking && <CircularProgress size={20} />}
              {deploy.status === AppStatus.Configured && <CheckCircleOutlineIcon sx={{ color: 'limegreen' }} />}
              {deploy.status === AppStatus.NotConfigured && <CancelOutlinedIcon sx={{ color: 'red' }} />}
              {deploy.status === AppStatus.Pending && <RemoveCircleOutlineRoundedIcon />}

              <Typography marginLeft={1}>{deploy.name}</Typography>

              {deploy.detail && (
                <Tooltip
                  title={
                    <Typography
                      variant="body2"
                      color="inherit"
                      sx={{ overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-line' }}
                    >
                      {deploy.detail}
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

export default DeploymentStatusView
