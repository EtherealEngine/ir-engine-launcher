import { Channels } from 'constants/Channels'
import Endpoints from 'constants/Endpoints'
import Storage from 'constants/Storage'
import { OSType } from 'models/AppSysInfo'
import { useSnackbar } from 'notistack'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { useSettingsState } from 'renderer/services/SettingsService'

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
  const { enqueueSnackbar } = useSnackbar()

  const configFileState = useConfigFileState()
  const { loading } = configFileState.value
  const settingsState = useSettingsState()
  const { appSysInfo } = settingsState.value

  const changeFolder = async (key: string) => {
    let path: string = await window.electronAPI.invoke(Channels.Utilities.SelectFolder)

    if (path) {
      // On windows we need to make sure its WSL folder.
      if (appSysInfo.osType === OSType.Windows) {
        if (path.startsWith(Endpoints.Paths.WSL_PREFIX)) {
          path = path.replace(Endpoints.Paths.WSL_PREFIX, '').replaceAll('\\', '/')
        } else {
          enqueueSnackbar('Please select a folder in your WSL Ubuntu distribution.', { variant: 'error' })
          return
        }
      }

      onChange(key, path)
    }
  }

  return (
    <Box sx={sx}>
      <Box display="flex" width="100%" alignItems="center">
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
        <InfoTooltip
          ml={1}
          message="Folder of Ethereal Engine source code. This folder should be inside `Home` directory."
        />
      </Box>
      <Box display="flex" width="100%" alignItems="center">
        <TextField
          disabled
          fullWidth
          margin="dense"
          size="small"
          label={Storage.OPS_PATH.replaceAll('_', ' ')}
          value={localConfigs[Storage.OPS_PATH]}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  title="Change Path"
                  disabled={loading}
                  onClick={() => changeFolder(Storage.OPS_PATH)}
                >
                  <FolderOutlinedIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <InfoTooltip ml={1} message="Folder of Ethereal Engine OPS source code." />
      </Box>
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
