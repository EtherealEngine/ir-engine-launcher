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

import ConfigConfigsView from './ConfigConfigsView'
import ConfigVarsView from './ConfigVarsView'

interface Props {
  onClose: () => void
}

const SettingsDialog = ({ onClose }: Props) => {
  const settingsState = useSettingsState()
  const { appVersion, configs, vars } = settingsState.value
  const [tempConfigs, setTempConfigs] = useState({} as Record<string, string>)
  const [tempVars, setTempVars] = useState({} as Record<string, string>)

  const localConfigs = {} as Record<string, string>
  for (const key in configs.data) {
    localConfigs[key] = key in tempConfigs ? tempConfigs[key] : configs.data[key]
  }

  const localVars = {} as Record<string, string>
  for (const key in vars.data) {
    localVars[key] = key in tempVars ? tempVars[key] : vars.data[key]
  }

  const changeConfig = async (key: string, value: string) => {
    const newConfigs = { ...tempConfigs }
    newConfigs[key] = value
    setTempConfigs(newConfigs)
  }

  const changeVar = async (key: string, value: string) => {
    const newVars = { ...tempVars }
    newVars[key] = value
    setTempVars(newVars)
  }

  const saveSettings = async () => {
    const saved = await SettingsService.saveSettings(tempConfigs, tempVars)
    if (saved) {
      onClose()
    }
  }

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      {(configs.loading || vars.loading) && <LinearProgress />}
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '40vh' }}>
        <DialogContentText variant="button">App Version: {appVersion}</DialogContentText>

        <DialogContentText variant="button" sx={{ marginTop: 4 }}>
          Configs
        </DialogContentText>
        <ConfigConfigsView localConfigs={localConfigs} onChange={changeConfig} sx={{ paddingLeft: 2 }} />

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
            configs.loading ||
            vars.loading ||
            (Object.keys(tempConfigs).length === 0 && Object.keys(tempVars).length === 0)
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
