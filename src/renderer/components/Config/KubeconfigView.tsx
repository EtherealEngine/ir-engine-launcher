import { Buffer } from 'buffer'
import { toTitleCase } from 'common/UtilitiesManager'
import Channels from 'constants/Channels'
import Storage from 'constants/Storage'
import { FetchableItem } from 'models/FetchableItem'
import { KubeconfigType, KubeContext } from 'models/Kubeconfig'
import { useEffect, useState } from 'react'
import InfoTooltip from 'renderer/common/InfoTooltip'
import LoadingPage from 'renderer/pages/LoadingPage'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { WorkloadsService } from 'renderer/services/WorkloadsService'

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
  Theme,
  Typography
} from '@mui/material'

interface Props {
  localConfigs: Record<string, string>
  onChange: (records: Record<string, string>) => void
  sx?: SxProps<Theme>
}

const defaultKubeState = {
  data: [],
  loading: true,
  error: ''
}

const KubeconfigView = ({ localConfigs, onChange, sx }: Props) => {
  const [kubeContext, setKubeContext] = useState<FetchableItem<KubeContext[]>>(defaultKubeState)
  const configFileState = useConfigFileState()
  const { loading } = configFileState.value

  const kubeConfigType = localConfigs[Storage.KUBECONFIG_TYPE]
    ? (localConfigs[Storage.KUBECONFIG_TYPE] as KubeconfigType)
    : KubeconfigType.Default

  useEffect(() => {
    let typeValue: string | undefined = undefined

    if (kubeConfigType === KubeconfigType.File) {
      typeValue = localConfigs[Storage.KUBECONFIG_PATH]
    } else if (kubeConfigType === KubeconfigType.Text) {
      typeValue = Buffer.from(localConfigs[Storage.KUBECONFIG_TEXT], 'base64').toString()
    }

    loadKubeContexts(kubeConfigType, typeValue)
  }, [])

  const loadKubeContexts = async (type: KubeconfigType, typeValue?: string) => {
    try {
      setKubeContext(defaultKubeState)

      if (type === KubeconfigType.File && !typeValue) {
        setKubeContext({
          data: [],
          loading: false,
          error: 'Please select kubeconfig file.'
        })
        return
      }
      if (type === KubeconfigType.Text && !typeValue) {
        setKubeContext({
          data: [],
          loading: false,
          error: 'Please insert kubeconfig text.'
        })
        return
      }

      const contexts = await WorkloadsService.getKubeContexts(type, typeValue)

      setKubeContext({
        data: contexts,
        loading: false,
        error: ''
      })
    } catch (err) {
      setKubeContext({
        data: [],
        loading: false,
        error: err
      })
    }
  }

  const handleChangeConfigType = async (value: string) => {
    onChange({
      [Storage.KUBECONFIG_CONTEXT]: '',
      [Storage.KUBECONFIG_PATH]: '',
      [Storage.KUBECONFIG_TEXT]: '',
      [Storage.KUBECONFIG_TYPE]: value
    })

    loadKubeContexts(value as KubeconfigType)
  }

  const handleChangeFilePath = async (key: string) => {
    let path: string = await window.electronAPI.invoke(Channels.Utilities.SelectFile)

    if (path) {
      onChange({ [key]: path })
      loadKubeContexts(KubeconfigType.File, path)
    }
  }

  return (
    <Box sx={sx}>
      <FormControl fullWidth margin="dense" size="small" disabled={loading}>
        <InputLabel id="kubeconfig-type-label">Config Type</InputLabel>
        <Select
          labelId="kubeconfig-type-label"
          label="Config Type"
          value={kubeConfigType}
          onChange={(event) => {
            const value = event.target.value.toString()
            handleChangeConfigType(value)
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
                    disabled={loading}
                    onClick={() => handleChangeFilePath(Storage.KUBECONFIG_PATH)}
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
          rows={6}
          multiline
          fullWidth
          inputProps={{ className: 'resizable font-14' }}
          disabled={loading}
          value={Buffer.from(localConfigs[Storage.KUBECONFIG_TEXT], 'base64').toString()}
          onChange={(event) =>
            onChange({ [Storage.KUBECONFIG_TEXT]: Buffer.from(event.target.value).toString('base64') })
          }
          onBlur={() =>
            loadKubeContexts(
              KubeconfigType.Text,
              Buffer.from(localConfigs[Storage.KUBECONFIG_TEXT], 'base64').toString()
            )
          }
        />
      )}

      {kubeContext.loading && <LoadingPage title="Loading kube contexts" variant="body2" isInPage sx={{ mt: 2 }} />}

      {!kubeContext.loading && (
        <FormControl fullWidth margin="dense" size="small" disabled={loading || kubeContext.data.length === 0}>
          <InputLabel id="kubecontext-label">Context</InputLabel>
          <Select
            labelId="kubecontext-label"
            label="Context"
            value={localConfigs[Storage.KUBECONFIG_CONTEXT] || kubeContext.data.find((item) => item.isDefault)?.name}
            onChange={(event) => {
              const value = event.target.value.toString()
              onChange({ [Storage.KUBECONFIG_CONTEXT]: value })
            }}
          >
            {kubeContext.data.map((item) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {kubeContext.error && (
        <Typography variant="body2" sx={{ ml: 1, mr: 1, color: 'red' }}>
          {kubeContext.error}
        </Typography>
      )}
    </Box>
  )
}

export default KubeconfigView
