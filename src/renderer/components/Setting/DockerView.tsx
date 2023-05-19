import Channels from 'constants/Channels'
import Commands from 'main/Clusters/BaseCluster/BaseCluster.commands'
import MinikubeCommands from 'main/Clusters/Minikube/Minikube.commands'
import { AppStatus } from 'models/AppStatus'
import { cloneCluster, ClusterType } from 'models/Cluster'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import ErrorPage from 'renderer/pages/ErrorPage'
import LoadingPage from 'renderer/pages/LoadingPage'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

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

import InfoTooltip from '../../common/InfoTooltip'
import AlertDialog from '../../dialogs/AlertDialog'

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

let UIElements = {
  promptText: '',
  dependantId: 'docker',
  dependantName: 'Docker',
  fetchCommand: Commands.DOCKER_STATS,
  pruneCommand: Commands.DOCKER_PRUNE
}

const DockerView = ({ sx }: Props) => {
  const { enqueueSnackbar } = useSnackbar()
  const [showAlert, setAlert] = useState(false)
  const [processingDiskPrune, setProcessingDiskPrune] = useState(false)
  const [loadingDiskStats, setLoadingDiskStats] = useState(false)
  const [errorDiskStats, setErrorDiskStats] = useState('')
  const [diskStats, setDiskStats] = useState<StatInfo[]>([])

  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  if (selectedCluster?.type === ClusterType.Minikube) {
    UIElements = {
      promptText: ' running in Minikube',
      dependantId: 'minikube',
      dependantName: 'Minikube',
      fetchCommand: MinikubeCommands.DOCKER_STATS,
      pruneCommand: MinikubeCommands.DOCKER_PRUNE
    }
  }

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.value.find((item) => item.clusterId === selectedClusterId)
  const dependantStatus = currentDeployment?.appStatus.find((app) => app.id === UIElements.dependantId)

  useEffect(() => {
    if (dependantStatus?.status === AppStatus.Configured) {
      fetchDiskStats()
    } else if (dependantStatus?.status === AppStatus.NotConfigured) {
      clearDiskStats()
    }
  }, [])

  if (!selectedCluster) {
    return <></>
  }

  const clearDiskStats = async () => {
    setLoadingDiskStats(false)
    setErrorDiskStats('')
    setDiskStats([])
  }

  const pruneDiskStats = async () => {
    try {
      setAlert(false)
      setProcessingDiskPrune(true)

      const clonedCluster = cloneCluster(selectedCluster)
      await window.electronAPI.invoke(Channels.Shell.ExecuteCommand, clonedCluster, UIElements.pruneCommand)
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

      const clonedCluster = cloneCluster(selectedCluster)
      let output = await window.electronAPI.invoke(
        Channels.Shell.ExecuteCommand,
        clonedCluster,
        UIElements.fetchCommand
      )
      output = output.split('}').join('},').slice(0, -1)
      output = `[${output}]`

      const stats = JSON.parse(output)
      setDiskStats(stats)
    } catch (err) {
      setErrorDiskStats('Failed to fetch docker stats')
    }

    setLoadingDiskStats(false)
  }

  if (dependantStatus?.status === AppStatus.Checking) {
    return <LoadingPage title={`Checking ${UIElements.dependantName}`} variant="body1" isInPage />
  } else if (dependantStatus?.status === AppStatus.NotConfigured) {
    return (
      <ErrorPage
        error={`${UIElements.dependantName} Not Configured`}
        detail={`Please configure ${UIElements.dependantName} before trying again.`}
        onRetry={() => DeploymentService.fetchDeploymentStatus(selectedCluster)}
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
              <InfoTooltip
                message={`This will prune docker system and clean up space being consumed by docker${UIElements.promptText}.`}
              />
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
            <Box sx={{ display: 'flex', color: 'var(--textColor)' }}>
              <CircularProgress size={24} sx={{ marginRight: 1 }} />
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
          message={`Are you sure you want to proceed? This will clear docker system${UIElements.promptText}.`}
          okButtonText="Proceed"
          onClose={() => setAlert(false)}
          onOk={pruneDiskStats}
        />
      )}
    </Box>
  )
}

export default DockerView
