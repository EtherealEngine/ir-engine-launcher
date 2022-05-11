import { useSettingsState } from 'renderer/services/SettingsService'

import { Box, DialogContentText, SxProps, TextField, Theme } from '@mui/material'

interface Props {
  localVars: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const ConfigVarsView = ({ localVars, onChange, sx }: Props) => {
  const settingsState = useSettingsState()
  const { vars } = settingsState.value

  return (
    <Box sx={sx}>
      {vars.error && <DialogContentText color={'red'}>Error: {vars.error}</DialogContentText>}
      {Object.keys(localVars).map((key) => (
        <TextField
          fullWidth
          key={key}
          margin="dense"
          size="small"
          label={key.replaceAll('_', ' ')}
          variant="standard"
          value={localVars[key]}
          onChange={(event) => onChange(key, event.target.value)}
        />
      ))}
    </Box>
  )
}

export default ConfigVarsView
