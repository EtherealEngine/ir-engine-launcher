import { useSettingsState } from 'renderer/services/SettingsService'

import { Box, DialogContentText, SxProps, TextField, Theme } from '@mui/material'

interface Props {
  localVars: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const ConfigVarsView = ({ localVars, onChange, sx }: Props) => {
  const settingsState = useSettingsState()
  const { configVars } = settingsState.value

  return (
    <Box sx={sx}>
      {configVars.error && <DialogContentText color={'red'}>Error: {configVars.error}</DialogContentText>}
      {Object.keys(configVars.vars).map((key) => (
        <TextField
          fullWidth
          key={key}
          margin="dense"
          label={key.replaceAll('_', ' ')}
          variant="standard"
          value={key in localVars ? localVars[key] : configVars.vars[key]}
          onChange={(event) => onChange(key, event.target.value)}
        />
      ))}
    </Box>
  )
}

export default ConfigVarsView
