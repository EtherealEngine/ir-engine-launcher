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
  const { appVersion, configPaths, configVars } = settingsState.value
  const [tempPaths, setTempPaths] = useState({} as Record<string, string>)
  const [tempVars, setTempVars] = useState({} as Record<string, string>)

  const localPaths = {} as Record<string, string>
  for (const key in configPaths.paths) {
    localPaths[key] = key in tempPaths ? tempPaths[key] : configPaths.paths[key]
  }

  const localVars = {} as Record<string, string>
  for (const key in configVars.vars) {
    localVars[key] = key in tempVars ? tempVars[key] : configVars.vars[key]
  }

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
      <DialogContent dividers sx={{ maxHeight: '40vh' }}>
        <DialogContentText variant="button">App Version: {appVersion}</DialogContentText>

        <DialogContentText variant="button" sx={{ marginTop: 4 }}>
          Paths
        </DialogContentText>
        <ConfigPathsView localPaths={localPaths} onChange={changePath} sx={{ paddingLeft: 2 }} />

        <DialogContentText variant="button" sx={{ marginTop: 4 }}>
          Variables
        </DialogContentText>
        <ConfigVarsView localVars={localVars} onChange={changeVar} sx={{ paddingLeft: 2 }} />
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
