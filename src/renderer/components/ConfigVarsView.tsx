import { useSnackbar } from 'notistack'
import { ConfigFileService, useConfigFileState } from 'renderer/services/ConfigFileService'

import { Box, DialogContentText, SxProps, TextField, Theme } from '@mui/material'

interface Props {
  localVars: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const ConfigVarsView = ({ localVars, onChange, sx }: Props) => {
  const { enqueueSnackbar } = useSnackbar()

  const configFileState = useConfigFileState()
  const { error } = configFileState.value

  const selectedCluster = ConfigFileService.getSelectedCluster()

  if (!selectedCluster) {
    enqueueSnackbar('Please select a cluster.', { variant: 'error' })
    return <></>
  }

  return (
    <Box sx={sx}>
      {error && <DialogContentText color={'red'}>Error: {error}</DialogContentText>}
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
