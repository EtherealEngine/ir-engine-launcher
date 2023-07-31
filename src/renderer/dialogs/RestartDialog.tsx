import Channels from 'constants/Channels'
import { cloneCluster } from 'models/Cluster'
import { ShellResponse } from 'models/ShellResponse'
import { enqueueSnackbar } from 'notistack'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'

import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

import logoMinikube from '../../../assets/icons/minikube.png'

interface Props {
  onClose: () => void
}

const RestartDialog = ({ onClose }: Props) => {
  const settingsState = useSettingsState()
  const selectedCluster = settingsState.value.enrollMokDialog.cluster

  const onRestart = async () => {
    try {
      const clonedCluster = cloneCluster(selectedCluster!)

      const password = await SettingsService.getDecryptedSudoPassword()

      const command = `echo '${password}' | sudo -S systemctl reboot`

      const output: ShellResponse = await window.electronAPI.invoke(
        Channels.Shell.ExecuteCommand,
        clonedCluster,
        command
      )

      const stringError = output.stderr?.toString().trim() || ''
      if (stringError.toLowerCase().includes('error')) {
        throw stringError
      }
    } catch (err) {
      enqueueSnackbar('Failed to restart.', { variant: 'error' })
    }
  }

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>To continue system needs to be rebooted</DialogTitle>
      <DialogContent dividers sx={{ padding: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            m: 2
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
            <Typography variant="body2">
              Secure Boot Module Signature key has been setup, you will need to restart this system to enroll it. After
              restarting, you will be presented with a MOK manager.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            <Typography variant="body2" sx={{ marginTop: 2 }}>
              Please follow these steps in the MOK manager:
            </Typography>
          </Box>
          <Box sx={{ ml: 1.5, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>1</Avatar>
              <Typography variant="body2">Press any key on first screen</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>1</Avatar>
              <Typography variant="body2">Select 'Enroll MOK' option</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mt: 1 }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>2</Avatar>
              <Typography variant="body2">Select 'Continue' on 'Enroll MOK' screen</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mt: 1 }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>3</Avatar>
              <Typography variant="body2">Select 'Yes' on 'Enroll the key(s)'' screen</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mt: 1 }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'var(--panelBackground)', mr: 1 }}>4</Avatar>
              <Typography variant="body2">Select 'Reboot' option in the final screen</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', mt: 1 }}>
              <Typography variant="body2" sx={{ marginTop: 2 }}>
                This will enroll a Secure Boot Module Signature key for your system.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', mt: 1 }}>
              <Typography variant="body2">
                After rebooting you can run 'Configure' button in Ethereal Engine Control Center again
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', mt: 1 }}>
              <Typography variant="body2" sx={{ marginTop: 2, fontWeight: 600 }}>
                Do you want to reboot the system?
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" onClick={onRestart}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RestartDialog
