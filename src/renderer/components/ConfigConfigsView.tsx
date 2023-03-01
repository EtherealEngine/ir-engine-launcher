import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
import { useSettingsState } from 'renderer/services/SettingsService'

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import {
  Box,
  DialogContentText,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  SxProps,
  TextField,
  Theme,
  Typography
} from '@mui/material'

import InfoTooltip from './InfoTooltip'

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
        label={Storage.ENGINE_PATH.replaceAll('_', ' ')}
        variant="standard"
        value={localConfigs[Storage.ENGINE_PATH]}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                title="Change Path"
                disabled={configs.loading}
                onClick={() => changeFolder(Storage.ENGINE_PATH)}
              >
                <FolderOutlinedIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <FormControlLabel
        labelPlacement="start"
        label={
          <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
            <Typography variant="body2">{Storage.ENABLE_RIPPLE_STACK.replaceAll('_', ' ')}</Typography>
            <InfoTooltip message="This will enable rippled server and IPFS in the cluster once configured." />
          </Box>
        }
        sx={{ marginTop: 2, marginLeft: 0 }}
        control={<Switch checked={localConfigs[Storage.ENABLE_RIPPLE_STACK] === 'true'} sx={{ marginLeft: 4 }} />}
        value={localConfigs[Storage.ENABLE_RIPPLE_STACK] === 'true'}
        onChange={(_event, checked) => onChange(Storage.ENABLE_RIPPLE_STACK, checked ? 'true' : 'false')}
      />
    </Box>
  )
}

export default ConfigConfigsView
