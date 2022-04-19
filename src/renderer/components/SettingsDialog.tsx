import { Channels } from 'constants/Channels'
import { useState } from 'react'
import { useSettingsState } from 'renderer/services/SettingsService'

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField
} from '@mui/material'

interface Props {
  onClose: () => void
}

const SettingsDialog = ({ onClose }: Props) => {
  const settingsState = useSettingsState()
  const { paths } = settingsState.value
  const [xrenginePath, setXrenginePath] = useState('')

  const changeFolder = async () => {
    const path = await window.electronAPI.invoke(Channels.Utilities.SelectFolder)
    if (path) {
      setXrenginePath(path)
    }
  }

  const saveSettings = () => {}

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      {paths.loading && <LinearProgress />}
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        {paths.error && <DialogContentText color={'red'}>Error: {paths.error}</DialogContentText>}
        <DialogContentText variant="button">Paths</DialogContentText>
        <TextField
          disabled
          fullWidth
          margin="dense"
          label="XREngine Path"
          variant="standard"
          value={xrenginePath ? xrenginePath : paths.xrengine}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" title="Change Path" onClick={changeFolder}>
                  <FolderOutlinedIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={paths.loading} onClick={saveSettings}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog
