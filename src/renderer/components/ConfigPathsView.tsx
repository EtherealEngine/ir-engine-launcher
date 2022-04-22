import { Channels } from 'constants/Channels'
import Storage from 'constants/Storage'
import { useSettingsState } from 'renderer/services/SettingsService'

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import { DialogContentText, IconButton, InputAdornment, TextField } from '@mui/material'

interface Props {
  localPaths: Record<string, string>
  onChange: (key: string, value: string) => void
}

const ConfigPathsView = ({ localPaths, onChange }: Props) => {
  const settingsState = useSettingsState()
  const { configPaths } = settingsState.value

  const changeFolder = async (key: string) => {
    const path = await window.electronAPI.invoke(Channels.Utilities.SelectFolder)
    if (path) {
      onChange(key, path)
    }
  }

  return (
    <>
      {configPaths.error && <DialogContentText color={'red'}>Error: {configPaths.error}</DialogContentText>}
      <TextField
        disabled
        fullWidth
        sx={{ marginLeft: 2 }}
        margin="dense"
        label="XREngine Path"
        variant="standard"
        value={
          localPaths[Storage.XRENGINE_PATH]
            ? localPaths[Storage.XRENGINE_PATH]
            : configPaths.paths[Storage.XRENGINE_PATH]
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                title="Change Path"
                disabled={configPaths.loading}
                onClick={() => changeFolder(Storage.XRENGINE_PATH)}
              >
                <FolderOutlinedIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </>
  )
}

export default ConfigPathsView
