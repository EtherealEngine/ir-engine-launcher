import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
import { useState } from 'react'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'

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
  const { configPaths, configVars } = settingsState.value
  const [tempPaths, setTempPaths] = useState({} as Record<string, string>)
  const [tempVars, setTempVars] = useState({} as Record<string, string>)

  const changeFolder = async (key: string) => {
    const path = await window.electronAPI.invoke(Channels.Utilities.SelectFolder)
    if (path) {
      const newPaths = { ...tempPaths }
      newPaths[key] = path
      setTempPaths(newPaths)
    }
  }

  const changeVar = async (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, key: string) => {
    const newVars = { ...tempVars }
    newVars[key] = event.target.value
    setTempVars(newVars)
  }

  const saveSettings = async () => {
    const saved = await SettingsService.saveSettings(tempPaths)
    if (saved) {
      onClose()
    }
  }

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      {(configPaths.loading || configVars.loading) && <LinearProgress />}
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers sx={{overflowX: 'hidden'}}>
        {configPaths.error && <DialogContentText color={'red'}>Error: {configPaths.error}</DialogContentText>}
        <DialogContentText variant="button">Paths</DialogContentText>
        <TextField
          disabled
          fullWidth
          sx={{ marginLeft: 2 }}
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
                <IconButton
                  edge="end"
                  title="Change Path"
                  disabled={configPaths.loading}
                  onClick={() => changeFolder(Storage.XRENGINE_PATH)}
                >
                  <FolderOutlinedIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {configVars.error && <DialogContentText color={'red'}>Error: {configVars.error}</DialogContentText>}
        <DialogContentText variant="button" sx={{ marginTop: 4 }}>
          Variables
        </DialogContentText>
        {Object.keys(configVars.vars).map((key) => (
          <TextField
            fullWidth
            sx={{ marginLeft: 2 }}
            key={key}
            margin="dense"
            label={key.replaceAll('_', ' ')}
            variant="standard"
            value={tempVars[key] ? tempVars[key] : configVars.vars[key]}
            onChange={(event) => changeVar(event, key)}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          disabled={
            configPaths.loading ||
            configVars.loading ||
            (Object.keys(tempPaths).length === 0 && Object.keys(tempVars).length === 0)
          }
          onClick={saveSettings}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog
