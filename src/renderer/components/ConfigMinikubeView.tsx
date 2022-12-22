import { Channels } from 'constants/Channels'
import Commands from 'constants/Commands'
import { AppStatus } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import ErrorPage from 'renderer/pages/ErrorPage'
import LoadingPage from 'renderer/pages/LoadingPage'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'
import { useHookedEffect } from 'renderer/services/useHookedEffect'

import { LoadingButton } from '@mui/lab'
import {
  Box,
  CircularProgress,
  FormControlLabel,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography
} from '@mui/material'

import AlertDialog from '../common/AlertDialog'
import InfoTooltip from '../common/InfoTooltip'

interface Props {
  sx?: SxProps<Theme>
}

type StatInfo = {
  Active: string
  Reclaimable: string
  Size: string
  TotalCount: string
  Type: string
}

const ConfigMinikubeView = ({ sx }: Props) => {
  const [showAlert, setAlert] = useState(false)
  const [processingDiskPrune, setProcessingDiskPrune] = useState(false)
  const [loadingDiskStats, setLoadingDiskStats] = useState(false)
  const [errorDiskStats, setErrorDiskStats] = useState('')
  const [diskStats, setDiskStats] = useState<StatInfo[]>([])
  const { enqueueSnackbar } = useSnackbar()

  const deploymentState = useDeploymentState()
  const { appStatus } = deploymentState.value
  const minikubeStatus = appStatus.find((app) => app.id === 'minikube')

  const clearDiskStats = async () => {
    setLoadingDiskStats(false)
    setErrorDiskStats('')
    setDiskStats([])
  }

  const pruneDiskStats = async () => {
    try {
      setAlert(false)
      setProcessingDiskPrune(true)

      await window.electronAPI.invoke(Channels.Shell.ExecuteCommand, Commands.DOCKER_PRUNE)
      await fetchDiskStats()
    } catch (err) {
      enqueueSnackbar('Failed to clear docker system.', { variant: 'error' })
    }

    setProcessingDiskPrune(false)
  }

  const fetchDiskStats = async () => {
    try {
      if (loadingDiskStats) {
        return
      }

      setLoadingDiskStats(true)
      setErrorDiskStats('')

      let output = await window.electronAPI.invoke(Channels.Shell.ExecuteCommand, Commands.DOCKER_STATS)
      output = output.split('}').join('},').slice(0, -1)
      output = `[${output}]`

      const stats = JSON.parse(output)
      setDiskStats(stats)
    } catch (err) {
      setErrorDiskStats('Failed to fetch docker stats')
    }

    setLoadingDiskStats(false)
  }

  useHookedEffect(() => {
    if (minikubeStatus?.status === AppStatus.Configured) {
      fetchDiskStats()
    } else if (minikubeStatus?.status === AppStatus.NotConfigured) {
      clearDiskStats()
    }
  }, [deploymentState.appStatus])

  useEffect(() => {
    if (minikubeStatus?.status === AppStatus.Configured) {
      fetchDiskStats()
    }
  }, [])

  if (minikubeStatus?.status === AppStatus.Checking) {
    return <LoadingPage title="Checking Minikube" variant="body1" isInPage />
  } else if (minikubeStatus?.status === AppStatus.NotConfigured) {
    return (
      <ErrorPage
        error="Minikube Not Configured"
        detail="Please configure minikube before trying again."
        onRetry={DeploymentService.fetchDeploymentStatus}
        variant="body1"
        isInPage
      />
    )
  }

  return (
    <Box sx={sx}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
        <FormControlLabel
          labelPlacement="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
              <Typography variant="body2">CLEAR DOCKER SYSTEM</Typography>
              <InfoTooltip message="This will prune docker system and clean up space being consumed by docker running in minikube." />
            </Box>
          }
          control={<></>}
          sx={{ marginTop: 2, marginLeft: 0 }}
        />
        <LoadingButton
          variant="outlined"
          sx={{ marginLeft: 4, width: processingDiskPrune ? 130 : 'auto' }}
          loading={processingDiskPrune}
          loadingIndicator={
            <Box sx={{ display: 'flex', color: '#ffffffab' }}>
              <CircularProgress color="inherit" size={24} sx={{ marginRight: 1 }} />
              Pruning
            </Box>
          }
          onClick={() => setAlert(true)}
        >
          Prune
        </LoadingButton>
      </Box>

      <FormControlLabel
        labelPlacement="start"
        label={
          <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
            <Typography variant="body2">DOCKER STATS:</Typography>
            <InfoTooltip message="Below table displays the disk space being consumed by docker system." />
          </Box>
        }
        control={<></>}
        sx={{ mt: 2, ml: 0 }}
      />

      {loadingDiskStats && <LoadingPage title="Loading Docker Stats" variant="body1" isInPage />}

      {errorDiskStats && <ErrorPage error={errorDiskStats} onRetry={fetchDiskStats} variant="body1" isInPage />}

      {!loadingDiskStats && !errorDiskStats && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 13 }}>Type</TableCell>
                <TableCell sx={{ fontSize: 13 }}>Total</TableCell>
                <TableCell sx={{ fontSize: 13 }}>Active</TableCell>
                <TableCell sx={{ fontSize: 13 }}>Size</TableCell>
                <TableCell sx={{ fontSize: 13 }}>Reclaimable</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diskStats.map((stat) => (
                <TableRow key={stat.Type}>
                  <TableCell sx={{ fontSize: 13 }}>{stat.Type}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{stat.TotalCount}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{stat.Active}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{stat.Size}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{stat.Reclaimable}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {showAlert && (
        <AlertDialog
          title="Confirmation"
          message="Are you sure you want to proceed? This will clear docker system running in minikube."
          okButtonText="Proceed"
          onClose={() => setAlert(false)}
          onOk={pruneDiskStats}
        />
      )}
    </Box>
  )
}

export default ConfigMinikubeView
