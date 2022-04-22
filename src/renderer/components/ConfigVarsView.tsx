import { useSettingsState } from 'renderer/services/SettingsService'

import { DialogContentText, TextField } from '@mui/material'

interface Props {
  localVars: Record<string, string>
  onChange: (key: string, value: string) => void
}

const ConfigVarsView = ({ localVars, onChange }: Props) => {
  const settingsState = useSettingsState()
  const { configVars } = settingsState.value

  return (
    <>
      {configVars.error && <DialogContentText color={'red'}>Error: {configVars.error}</DialogContentText>}
      {Object.keys(configVars.vars).map((key) => (
        <TextField
          fullWidth
          sx={{ marginLeft: 2 }}
          key={key}
          margin="dense"
          label={key.replaceAll('_', ' ')}
          variant="standard"
          value={key in localVars ? localVars[key] : configVars.vars[key]}
          onChange={(event) => onChange(key, event.target.value)}
        />
      ))}
    </>
  )
}

export default ConfigVarsView
