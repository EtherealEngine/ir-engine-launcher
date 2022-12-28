import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
import { useConfigFileState } from 'renderer/services/ConfigFileService'

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import {
  Box,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  SxProps,
  TextField,
  Theme,
  Typography
} from '@mui/material'

import InfoTooltip from '../common/InfoTooltip'

interface Props {
  localConfigs: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const ConfigConfigsView = ({ localConfigs, onChange, sx }: Props) => {
  const configFileState = useConfigFileState()
  const { loading } = configFileState.value

  const changeFolder = async (key: string) => {
    const path = await window.electronAPI.invoke(Channels.Utilities.SelectFolder)
    if (path) {
      onChange(key, path)
    }
  }

  return (
    <Box sx={sx}>
      <TextField
        disabled
        fullWidth
        margin="dense"
        size="small"
        label={Storage.ENGINE_PATH.replaceAll('_', ' ')}
        value={localConfigs[Storage.ENGINE_PATH]}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                title="Change Path"
                disabled={loading}
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
