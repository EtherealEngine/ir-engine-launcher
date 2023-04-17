import { AppModel, AppStatus } from 'models/AppStatus'
import { Fragment, useState } from 'react'

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import { Box, CircularProgress, FormControlLabel, Grid, Switch, Typography } from '@mui/material'
import { Variant } from '@mui/material/styles/createTypography'

import InfoTooltip from '../common/InfoTooltip'

interface Props {
  statuses: AppModel[]
  title: string
}

const StatusView = ({ statuses, title }: Props) => {
  const [showStatus, setShowStatus] = useState(true)

  const checking = statuses.find((status) => status.status === AppStatus.Checking)
  const allConfigured = statuses.every((status) => status.status === AppStatus.Configured)
  const allNotConfigured = statuses.every((status) => status.status === AppStatus.NotConfigured)

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5">{title}:</Typography>
          {checking && (
            <Fragment>
              <CircularProgress size={20} sx={{ marginLeft: 2, marginRight: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'light' }}>
                {' '}
                Checking
              </Typography>
            </Fragment>
          )}
          {!checking && allConfigured && (
            <Fragment>
              <CheckCircleOutlineIcon sx={{ marginLeft: 2, marginRight: 1, fill: 'limegreen' }} />
              <Typography variant="h6" sx={{ fontWeight: 'light' }}>
                {' '}
                All Configured
              </Typography>
            </Fragment>
          )}
          {!checking && allNotConfigured && (
            <Fragment>
              <CancelOutlinedIcon sx={{ marginLeft: 2, marginRight: 1, fill: 'red' }} />
              <Typography variant="h6" sx={{ fontWeight: 'light' }}>
                {' '}
                Nothing Configured
              </Typography>
            </Fragment>
          )}
          {!checking && !allConfigured && !allNotConfigured && (
            <Fragment>
              <RemoveCircleOutlineRoundedIcon sx={{ marginLeft: 2, marginRight: 1, fill: 'orange' }} />
              <Typography variant="h6" sx={{ fontWeight: 'light' }}>
                {' '}
                Pending Configuration
              </Typography>
            </Fragment>
          )}
        </Box>
        <FormControlLabel
          value={showStatus}
          control={<Switch defaultChecked color="primary" />}
          label={showStatus ? 'Hide Details' : 'Show Details'}
          labelPlacement="start"
          onChange={(_event, checked) => setShowStatus(checked)}
        />
      </Box>
      {showStatus && (
        <Grid container>
          {statuses.map((status) => (
            <StatusViewItem key={status.id} status={status} />
          ))}
        </Grid>
      )}
    </Box>
  )
}

interface StatusViewItemProps {
  status: AppModel
  titleVariant?: Variant
}

export const StatusViewItem = ({ status, titleVariant }: StatusViewItemProps) => {
  return (
    <Grid
      item
      key={status.id}
      xs={12}
      md={3}
      sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 2 }}
    >
      {status.status === AppStatus.Checking && <CircularProgress size={20} />}
      {status.status === AppStatus.Configured && <CheckCircleOutlineIcon sx={{ fill: 'limegreen' }} />}
      {status.status === AppStatus.NotConfigured && <CancelOutlinedIcon sx={{ fill: 'red' }} />}
      {status.status === AppStatus.Pending && <RemoveCircleOutlineRoundedIcon />}

      <Box marginLeft={1}>
        <Typography variant={titleVariant}>{status.name}</Typography>

        {status.description && <Typography variant="body2">{status.description}</Typography>}
      </Box>

      {status.detail && <InfoTooltip message={status.detail} />}
    </Grid>
  )
}

export default StatusView
