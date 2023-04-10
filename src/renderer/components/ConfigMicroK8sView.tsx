import { decryptPassword, delay } from 'common/UtilitiesManager'
import Channels from 'constants/Channels'
import Commands from 'main/Clusters/MicroK8s/MicroK8s.commands'
import { OSType } from 'models/AppSysInfo'
import { cloneCluster } from 'models/Cluster'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { accessSettingsState, SettingsService } from 'renderer/services/SettingsService'

import { LoadingButton } from '@mui/lab'
import { Box, CircularProgress, FormControlLabel, SxProps, Theme, Typography } from '@mui/material'

import InfoTooltip from '../common/InfoTooltip'
import AlertDialog from '../dialogs/AlertDialog'

interface Props {
  sx?: SxProps<Theme>
}

const ConfigMicroK8sView = ({ sx }: Props) => {
  const { enqueueSnackbar } = useSnackbar()
  const [showAlert, setAlert] = useState(false)
  const [processingMicroK8sPrune, setProcessingMicroK8sPrune] = useState(false)

  const configFileState = useConfigFileState()
  const { selectedCluster } = configFileState.value

  if (!selectedCluster) {
    return <></>
  }

  const microK8sPrune = async () => {
    try {
      setAlert(false)
      setProcessingMicroK8sPrune(true)

      const clonedCluster = cloneCluster(selectedCluster)

      const appSysInfo = accessSettingsState().value.appSysInfo
      let sudoPassword = accessSettingsState().value.sudoPassword

      if (!sudoPassword) {
        SettingsService.setAuthenticationDialog(true)

        while (!sudoPassword) {
          await delay(1000)
          sudoPassword = accessSettingsState().value.sudoPassword
        }
      }

      const password = decryptPassword(sudoPassword)

      let command = `echo '${password}' | sudo -S ${Commands.MICROK8S_REMOVE}`
      if (appSysInfo.osType === OSType.Windows) {
        command = `wsl bash -c "${command}"`
      }
      await window.electronAPI.invoke(Channels.Shell.ExecuteCommand, clonedCluster, command)
    } catch (err) {
      enqueueSnackbar('Failed to remove microK8s.', { variant: 'error' })
    }

    setProcessingMicroK8sPrune(false)
  }

  return (
    <Box sx={sx}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
        <FormControlLabel
          labelPlacement="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
              <Typography variant="body2">REMOVE MICROK8S</Typography>
              <InfoTooltip message="This will remove microK8s from your machine." />
            </Box>
          }
          control={<></>}
          sx={{ marginTop: 2, marginLeft: 0 }}
        />
        <LoadingButton
          variant="outlined"
          sx={{ marginLeft: 4, width: processingMicroK8sPrune ? 130 : 'auto' }}
          loading={processingMicroK8sPrune}
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

      {showAlert && (
        <AlertDialog
          title="Confirmation"
          message="Are you sure you want to proceed? This will remove microK8s from your machine."
          okButtonText="Proceed"
          onClose={() => setAlert(false)}
          onOk={microK8sPrune}
        />
      )}
    </Box>
  )
}

export default ConfigMicroK8sView
