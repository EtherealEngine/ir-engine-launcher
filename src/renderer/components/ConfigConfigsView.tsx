import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
import { useSettingsState } from 'renderer/services/SettingsService'

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import { Box, DialogContentText, IconButton, InputAdornment, SxProps, TextField, Theme } from '@mui/material'

interface Props {
  localConfigs: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const ConfigConfigsView = ({ localConfigs, onChange, sx }: Props) => {
  const settingsState = useSettingsState()
  const { configs } = settingsState.value

  const changeFolder = async (key: string) => {
    const path = await window.electronAPI.invoke(Channels.Utilities.SelectFolder)
    if (path) {
      onChange(key, path)
    }
  }

  return (
    <Box sx={sx}>
      {configs.error && <DialogContentText color={'red'}>Error: {configs.error}</DialogContentText>}
      <TextField
        disabled
        fullWidth
        margin="dense"
        size="small"
        label={Storage.XRENGINE_PATH.replaceAll('_', ' ')}
        variant="standard"
        value={localConfigs[Storage.XRENGINE_PATH]}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                title="Change Path"
                disabled={configs.loading}
                onClick={() => changeFolder(Storage.XRENGINE_PATH)}
              >
                <FolderOutlinedIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
}

export default ConfigConfigsView
