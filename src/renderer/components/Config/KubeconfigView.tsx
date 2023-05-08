import { toTitleCase } from 'common/UtilitiesManager'
import Channels from 'constants/Channels'
import Storage from 'constants/Storage'
import { useState } from 'react'
import InfoTooltip from 'renderer/common/InfoTooltip'

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
  TextField,
  Theme
} from '@mui/material'

interface Props {
  localConfigs: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

enum KubeconfigType {
  Default = 'Default',
  File = 'File',
  Text = 'Text'
}

const KubeconfigView = ({ localConfigs, onChange, sx }: Props) => {
  const [kubeConfigType, setKubeConfigType] = useState<KubeconfigType>(KubeconfigType.Default)

  const changeFilePath = async (key: string) => {
    let path: string = await window.electronAPI.invoke(Channels.Utilities.SelectFile)

    if (path) {
      alert(path)
      onChange(key, path)
    }
  }

  return (
    <Box sx={sx}>
      <FormControl fullWidth margin="dense" size="small">
        <InputLabel id="kubeconfig-type-label">Config Type</InputLabel>
        <Select
          labelId="kubeconfig-type-type-label"
          label="Config Type"
          value={kubeConfigType}
          onChange={(event) => {
            const value = event.target.value.toString()
            const type = value as KubeconfigType
            setKubeConfigType(type)
          }}
        >
          {Object.keys(KubeconfigType)
            .filter((key) => isNaN(Number(key)))
            .map((item) => (
              <MenuItem key={item} value={item}>
                {KubeconfigType[item]}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {kubeConfigType === KubeconfigType.File && (
        <Box display="flex" width="100%" alignItems="center">
          <TextField
            disabled
            fullWidth
            margin="dense"
            size="small"
            label={toTitleCase(Storage.KUBECONFIG_PATH.replaceAll('_', ' '))}
            value={localConfigs[Storage.KUBECONFIG_PATH]}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    title="Change Path"
                    // disabled={loading}
                    onClick={() => changeFilePath(Storage.KUBECONFIG_PATH)}
                  >
                    <FolderOutlinedIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <InfoTooltip ml={1} message="This is the path of kubeconfig file." />
        </Box>
      )}

      {kubeConfigType === KubeconfigType.Text && (
        <TextField
          label="Kubeconfig"
          margin="dense"
          size="small"
          rows={8}
          multiline
          fullWidth
          inputProps={{ className: 'resizable font-14' }}
        />
      )}
    </Box>
  )
}

export default KubeconfigView
