import { Box, SxProps, TextField, Theme } from '@mui/material'

interface Props {
  localVars: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const VarsView = ({ localVars, onChange, sx }: Props) => {
  return (
    <Box sx={sx}>
      {Object.keys(localVars).map((key) => (
        <TextField
          fullWidth
          key={key}
          margin="dense"
          size="small"
          label={key.replaceAll('_', ' ')}
          value={localVars[key]}
          onChange={(event) => onChange(key, event.target.value)}
        />
      ))}
    </Box>
  )
}

export default VarsView
