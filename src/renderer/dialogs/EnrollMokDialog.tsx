import Channels from 'constants/Channels'
import Commands from 'main/Clusters/BaseCluster/BaseCluster.commands'
import { cloneCluster } from 'models/Cluster'
import { ShellResponse } from 'models/ShellResponse'
import { enqueueSnackbar } from 'notistack'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'

import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

import logoMinikube from '../../../assets/icons/minikube.png'

interface Props {
  onClose: () => void
}

const EnrollMokDialog = ({ onClose }: Props) => {
  const settingsState = useSettingsState()
  const selectedCluster = settingsState.value.mokCluster

  const onSetupMok = async () => {
    try {
      const clonedCluster = cloneCluster(selectedCluster!)
      const output: ShellResponse = await window.electronAPI.invoke(
        Channels.Shell.ExecuteCommand,
        clonedCluster,
        Commands.SETUP_MOK
      )

      const stringError = output.stderr?.toString().trim() || ''
      if (stringError.toLowerCase().includes('error')) {
        throw stringError
      }

      SettingsService.setMokRestartDialog(true)
      onClose()
    } catch (err) {
      enqueueSnackbar('Failed to setup MOK.', { variant: 'error' })
    }
  }

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>Machine Owner Key (MOK) enrollment</DialogTitle>
      <DialogContent dividers sx={{ padding: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
            ml: 2,
            mr: 2,
            mt: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'row', mt: 1 }}>
            <Box
              sx={{
                width: '50%',
                height: '100%',
                flexDirection: 'column',
                display: 'flex',
                padding: 1,
                alignItems: 'center',
                borderRadius: 1,
                gap: 1
              }}
            >
              <Box sx={{ width: 45, mt: 0.5 }} component="img" src={logoMinikube} />
              <Typography variant="body1">{selectedCluster?.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', mt: 1 }}>
              <Typography variant="body2">
                UEFI Secure Boot is enabled for this system. You need a Secure Boot Module Signature key enrolled for
                Minikube configuration to proceed. Once you allow this app to enroll this Machine Owner Key, you will be
                presented with a terminal.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            <Typography variant="body2" sx={{ marginTop: 2 }}>
              Please follow these steps in the terminal to create a Secure Boot Module Signature key for your system:
            </Typography>
          </Box>
          <Box sx={{ ml: 1.5, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>1</Avatar>
              <Typography variant="body2">Enter sudo password</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mt: 1 }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>2</Avatar>
              <Typography variant="body2">In the 'Secure Boot' screen, press 'Escape' key</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mt: 1 }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>3</Avatar>
              <Typography variant="body2">Enter password for MOK management</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mt: 1 }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>4</Avatar>
              <Typography variant="body2">Confirm password for MOK management</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', mt: 1 }}>
            <Typography variant="body2" sx={{ marginTop: 2, fontWeight: 600 }}>
              Do you want to enroll Machine Owner Key?
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" onClick={onSetupMok}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EnrollMokDialog
