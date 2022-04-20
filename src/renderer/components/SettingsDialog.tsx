import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
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
  const { configPaths } = settingsState.value
  const [tempPaths, setTempPaths] = useState({} as Record<string, string>)

  const changeFolder = async (key: string) => {
    const path = await window.electronAPI.invoke(Channels.Utilities.SelectFolder)
    if (path) {
      const newPaths = { ...tempPaths }
      newPaths[key] = path
      setTempPaths(newPaths)
    }
  }

  const saveSettings = () => {}

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      {configPaths.loading && <LinearProgress />}
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        {configPaths.error && <DialogContentText color={'red'}>Error: {configPaths.error}</DialogContentText>}
        <DialogContentText variant="button">Paths</DialogContentText>
        <TextField
          disabled
          fullWidth
          margin="dense"
          label="XREngine Path"
          variant="standard"
          value={
            tempPaths[Storage.XRENGINE_PATH]
              ? tempPaths[Storage.XRENGINE_PATH]
              : configPaths.paths[Storage.XRENGINE_PATH]
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" title="Change Path" onClick={() => changeFolder(Storage.XRENGINE_PATH)}>
                  <FolderOutlinedIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={configPaths.loading} onClick={saveSettings}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog
