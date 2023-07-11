import { decryptPassword, delay } from 'common/UtilitiesManager'
import Channels from 'constants/Channels'
import Endpoints from 'constants/Endpoints'
import Commands from 'main/Clusters/Minikube/Minikube.commands'
import { ensureWSLToWindowsPath, fileExists } from 'main/managers/PathManager'
import { cloneCluster } from 'models/Cluster'
import { ShellResponse } from 'models/ShellResponse'
import { useSnackbar } from 'notistack'
import path from 'path'
import { useState } from 'react'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { accessSettingsState, SettingsService } from 'renderer/services/SettingsService'

import { LoadingButton } from '@mui/lab'
import { Box, CircularProgress, FormControlLabel, SxProps, TextField, Theme, Typography } from '@mui/material'

import Storage from '../../../constants/Storage'
import InfoTooltip from '../../common/InfoTooltip'
import AlertDialog from '../../dialogs/AlertDialog'
import DockerView from './DockerView'

interface Props {
  sx?: SxProps<Theme>
  onChange: (value: string) => void
}

const EngineView = ({ sx, onChange }: Props) => {
  const { enqueueSnackbar } = useSnackbar()
  const [showDeploymentAlert, setDeploymentAlert] = useState(false)
  const [showDatabaseAlert, setDatabaseAlert] = useState(false)
  const [showEnvAlert, setEnvAlert] = useState(false)
  const [processingDeploymentPrune, setProcessingDeploymentPrune] = useState(false)
  const [processingDatabaseClear, setProcessingDatabaseClear] = useState(false)
  const [processingEnvPrune, setProcessingEnvPrune] = useState(false)

  const configFileState = useConfigFileState()
  const { selectedCluster } = configFileState.value

  if (!selectedCluster) {
    return <></>
  }

  const onPruneDeployment = async () => {
    try {
      setDeploymentAlert(false)
      setProcessingDeploymentPrune(true)

      const clonedCluster = cloneCluster(selectedCluster)

      let sudoPassword = accessSettingsState().value.sudoPassword

      if (!sudoPassword) {
        SettingsService.setAuthenticationDialog(true)

        while (!sudoPassword) {
          await delay(1000)
          sudoPassword = accessSettingsState().value.sudoPassword
        }
      }

      const password = decryptPassword(sudoPassword)

      const command = `echo '${password}' | sudo -S helm uninstall local`
      const output: ShellResponse = await window.electronAPI.invoke(
        Channels.Shell.ExecuteCommand,
        clonedCluster,
        command
      )

      const stringError = output.stderr?.toString().trim() || ''
      if (stringError.toLowerCase().includes('error') || stringError.toLowerCase().includes('is not installed')) {
        throw stringError
      }
    } catch (err) {
      enqueueSnackbar('Failed to remove Ethereal Engine deployment.', { variant: 'error' })
    }

    setProcessingDeploymentPrune(false)
  }

  const onClearDatabase = async () => {
    try {
      setDatabaseAlert(false)
      setProcessingDatabaseClear(true)

      const clonedCluster = cloneCluster(selectedCluster)

      let sudoPassword = accessSettingsState().value.sudoPassword

      if (!sudoPassword) {
        SettingsService.setAuthenticationDialog(true)

        while (!sudoPassword) {
          await delay(1000)
          sudoPassword = accessSettingsState().value.sudoPassword
        }
      }

      const password = decryptPassword(sudoPassword)

      const command = `echo '${password}' | sudo -S ${Commands.DATABASE_CLEAR}`
      const output: ShellResponse = await window.electronAPI.invoke(
        Channels.Shell.ExecuteCommand,
        clonedCluster,
        command
      )

      const stringError = output.stderr?.toString().trim() || ''
      if (stringError.toLowerCase().includes('error') || stringError.toLowerCase().includes('is not installed')) {
        throw stringError
      }
    } catch (err) {
      enqueueSnackbar('Failed to clear database.', { variant: 'error' })
    }

    setProcessingDatabaseClear(false)
  }

  const onPruneEnv = async () => {
    try {
      setEnvAlert(false)
      setProcessingEnvPrune(true)

      const clonedCluster = cloneCluster(selectedCluster)
      const enginePath = await ensureWSLToWindowsPath(clonedCluster.configs[Storage.ENGINE_PATH])
      let envPath = path.join(enginePath, Endpoints.Paths.ENGINE_ENV)
      const envFileExists = await fileExists(envPath)

      if (envFileExists) {
        let sudoPassword = accessSettingsState().value.sudoPassword

        if (!sudoPassword) {
          SettingsService.setAuthenticationDialog(true)

          while (!sudoPassword) {
            await delay(1000)
            sudoPassword = accessSettingsState().value.sudoPassword
          }
        }

        const password = decryptPassword(sudoPassword)
        envPath = path.join(clonedCluster.configs[Storage.ENGINE_PATH], Endpoints.Paths.ENGINE_ENV)

        const command = `echo '${password}' | sudo -S rm -f ${envPath}`
        const output: ShellResponse = await window.electronAPI.invoke(
          Channels.Shell.ExecuteCommand,
          clonedCluster,
          command
        )

        const stringError = output.stderr?.toString().trim() || ''
        if (stringError.toLowerCase().includes('error') || stringError.toLowerCase().includes('is not installed')) {
          throw stringError
        }
      } else {
        enqueueSnackbar("Failed to remove .env.local file: File doesn't exist.", { variant: 'error' })
      }
    } catch (err) {
      enqueueSnackbar('Failed to remove .env.local file.', { variant: 'error' })
    }

    setProcessingDatabaseClear(false)
  }

  return (
    <Box sx={sx}>
      <Box display="flex" width="100%" alignItems="center">
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label={'FORCE MAKE ADMIN'}
          value={''}
          onChange={(event) => onChange(event.target.value)}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
        <FormControlLabel
          labelPlacement="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
              <Typography variant="body2">REMOVE ETHEREAL ENGINE DEPLOYMENT</Typography>
              <InfoTooltip message="This will remove current Ethereal Engine deployment from your machine." />
            </Box>
          }
          control={<></>}
          sx={{ marginTop: 2, marginLeft: 0 }}
        />
        <LoadingButton
          variant="outlined"
          sx={{ marginLeft: 4, width: processingDeploymentPrune ? 130 : 'auto' }}
          loading={processingDeploymentPrune}
          loadingIndicator={
            <Box sx={{ display: 'flex', color: 'var(--textColor)' }}>
              <CircularProgress size={24} sx={{ marginRight: 1 }} />
              Pruning
            </Box>
          }
          onClick={() => setDeploymentAlert(true)}
        >
          Prune
        </LoadingButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
        <FormControlLabel
          labelPlacement="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
              <Typography variant="body2">CLEAR DATABASE</Typography>
              <InfoTooltip message="This will clear the database." />
            </Box>
          }
          control={<></>}
          sx={{ marginTop: 2, marginLeft: 0 }}
        />
        <LoadingButton
          variant="outlined"
          sx={{ marginLeft: 4, width: processingDatabaseClear ? 130 : 'auto' }}
          loading={processingDatabaseClear}
          loadingIndicator={
            <Box sx={{ display: 'flex', color: 'var(--textColor)' }}>
              <CircularProgress size={24} sx={{ marginRight: 1 }} />
              Clearing
            </Box>
          }
          onClick={() => setDatabaseAlert(true)}
        >
          Clear
        </LoadingButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
        <FormControlLabel
          labelPlacement="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
              <Typography variant="body2">REMOVE ENV.LOCAL FILE</Typography>
              <InfoTooltip message="This will remove env.local file from this machine." />
            </Box>
          }
          control={<></>}
          sx={{ marginTop: 2, marginLeft: 0 }}
        />
        <LoadingButton
          variant="outlined"
          sx={{ marginLeft: 4, width: processingEnvPrune ? 130 : 'auto' }}
          loading={processingEnvPrune}
          loadingIndicator={
            <Box sx={{ display: 'flex', color: 'var(--textColor)' }}>
              <CircularProgress size={24} sx={{ marginRight: 1 }} />
              Pruning
            </Box>
          }
          onClick={() => setEnvAlert(true)}
        >
          Prune
        </LoadingButton>
      </Box>

      <DockerView sx={{ width: '100%', mt: 3 }} />

      {showDeploymentAlert && (
        <AlertDialog
          title="Confirmation"
          message="Are you sure you want to proceed? This will remove the current Ethereal Engine deployment from your machine."
          okButtonText="Proceed"
          onClose={() => setDeploymentAlert(false)}
          onOk={onPruneDeployment}
        />
      )}
      {showDatabaseAlert && (
        <AlertDialog
          title="Confirmation"
          message="Are you sure you want to proceed? This will clear the database."
          okButtonText="Proceed"
          onClose={() => setDatabaseAlert(false)}
          onOk={onClearDatabase}
        />
      )}
      {showEnvAlert && (
        <AlertDialog
          title="Confirmation"
          message="Are you sure you want to proceed? This will remove .env.local file from this machine."
          okButtonText="Proceed"
          onClose={() => setEnvAlert(false)}
          onOk={onPruneEnv}
        />
      )}
    </Box>
  )
}

export default EngineView
