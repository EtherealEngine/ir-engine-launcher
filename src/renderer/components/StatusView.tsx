import Channels from 'constants/Channels'
import Storage from 'constants/Storage'
import { AppModel, AppStatus } from 'models/AppStatus'
import { cloneCluster, ClusterModel } from 'models/Cluster'
import { ShellResponse } from 'models/ShellResponse'
import { Fragment, useState } from 'react'
import { accessConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService } from 'renderer/services/DeploymentService'
import { accessSettingsState } from 'renderer/services/SettingsService'

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ConstructionIcon from '@mui/icons-material/Construction'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import {
  Box,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  SxProps,
  Theme,
  Typography
} from '@mui/material'
import { Variant } from '@mui/material/styles/createTypography'

import InfoTooltip from '../common/InfoTooltip'

interface Props {
  statuses: AppModel[]
  title: string
}

const StatusView = ({ statuses, title }: Props) => {
  const [showStatus, setShowStatus] = useState(true)

  if (!statuses) {
    statuses = []
  }

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
  verticalAlignTop?: boolean
  titleSx?: SxProps<Theme>
  sx?: SxProps<Theme>
}

export const StatusViewItem = ({ status, titleVariant, verticalAlignTop, titleSx, sx }: StatusViewItemProps) => {
  const [isFixing, setFixing] = useState(false)

  return (
    <Grid
      item
      key={status.id}
      xs={12}
      md={3}
      sx={{
        display: 'flex',
        alignItems: verticalAlignTop ? undefined : 'center',
        flexDirection: 'row',
        marginBottom: 2,
        ...sx
      }}
    >
      {status.status === AppStatus.Checking && <CircularProgress size={20} />}
      {status.status === AppStatus.Configured && <CheckCircleOutlineIcon sx={{ fill: 'limegreen' }} />}
      {status.status === AppStatus.NotConfigured && <CancelOutlinedIcon sx={{ fill: 'red' }} />}
      {status.status === AppStatus.Pending && <RemoveCircleOutlineRoundedIcon />}

      <Box marginLeft={1} sx={titleSx}>
        {typeof status.name === 'string' && <Typography variant={titleVariant}>{status.name}</Typography>}
        {typeof status.name !== 'string' && status.name}

        {status.description && <Typography variant="body2">{status.description}</Typography>}
      </Box>

      {status.detail && <InfoTooltip sx={titleSx} message={status.detail} />}

      {status.status === AppStatus.NotConfigured && (status.id === 'mysql' || status.id === 'minio') && (
        <>
          {isFixing && <CircularProgress size={20} sx={{ ml: 2 }} />}
          {isFixing === false && (
            <IconButton
              title={`Fix ${status.name}`}
              color="primary"
              sx={{ ml: 2 }}
              onClick={() => onFix(status, setFixing)}
            >
              <ConstructionIcon sx={{ fill: '#ff8c00' }} />
            </IconButton>
          )}
        </>
      )}
    </Grid>
  )
}

const onFix = async (appStatus: AppModel, setFixing: React.Dispatch<React.SetStateAction<boolean>>) => {
  // Here we are cloning cluster object so that when selected Cluster is changed,
  // The context cluster does not change.
  const selectedCluster = accessConfigFileState().value.selectedCluster
  if (!selectedCluster) {
    return
  }

  setFixing(true)

  const clonedCluster = cloneCluster(selectedCluster)

  if (appStatus.id === 'mysql' || appStatus.id === 'minio') {
    await processOnFix(appStatus, clonedCluster, async () => {
      const command = `cd '${clonedCluster.configs[Storage.ENGINE_PATH]}' && npm run dev-docker`

      const output: ShellResponse = await window.electronAPI.invoke(
        Channels.Shell.ExecuteCommand,
        clonedCluster,
        command
      )
      if (output.error) {
        throw output.error
      }
    })
  }

  setFixing(false)
}

const processOnFix = async (app: AppModel, cluster: ClusterModel, callback: () => Promise<void>) => {
  try {
    await callback()

    await DeploymentService.fetchDeploymentStatus(cluster)
  } catch (err) {
    console.log(err)
    const { enqueueSnackbar } = accessSettingsState().value.notistack
    enqueueSnackbar(`Failed to fix ${app.name}. Please try running configure wizard.`, { variant: 'error' })
  }
}

export default StatusView
