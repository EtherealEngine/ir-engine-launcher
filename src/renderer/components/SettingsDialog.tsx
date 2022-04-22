import { useState } from 'react'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress
} from '@mui/material'

import ConfigPathsView from './ConfigPathsView'
import ConfigVarsView from './ConfigVarsView'

interface Props {
  onClose: () => void
}

const SettingsDialog = ({ onClose }: Props) => {
  const settingsState = useSettingsState()
  const { configPaths, configVars } = settingsState.value
  const [tempPaths, setTempPaths] = useState({} as Record<string, string>)
  const [tempVars, setTempVars] = useState({} as Record<string, string>)

  const changePath = async (key: string, value: string) => {
    const newPaths = { ...tempPaths }
    newPaths[key] = value
    setTempPaths(newPaths)
  }

  const changeVar = async (key: string, value: string) => {
    const newVars = { ...tempVars }
    newVars[key] = value
    setTempVars(newVars)
  }

  const saveSettings = async () => {
    const saved = await SettingsService.saveSettings(tempPaths, tempVars)
    if (saved) {
      onClose()
    }
  }

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      {(configPaths.loading || configVars.loading) && <LinearProgress />}
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers sx={{ overflowX: 'hidden' }}>
        <DialogContentText variant="button">Paths</DialogContentText>
        <ConfigPathsView localPaths={tempPaths} onChange={changePath} />
        <DialogContentText variant="button" sx={{ marginTop: 4 }}>
          Variables
        </DialogContentText>
        <ConfigVarsView localVars={tempVars} onChange={changeVar} />
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
