import { Buffer } from 'buffer'
import Storage from 'constants/Storage'
import { AppModel, AppStatus } from 'models/AppStatus'
import { KubeconfigType } from 'models/Kubeconfig'
import { useState } from 'react'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { WorkloadsService } from 'renderer/services/WorkloadsService'

import PowerIcon from '@mui/icons-material/Power'
import { Box, IconButton, InputAdornment, SxProps, TextField, Theme, Typography } from '@mui/material'

import InfoTooltip from '../../common/InfoTooltip'
import { StatusViewItem } from '../StatusView'

interface Props {
  localConfigs: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const DeploymentView = ({ localConfigs, onChange, sx }: Props) => {
  const configFileState = useConfigFileState()
  const { loading } = configFileState.value

  const [status, setStatus] = useState<AppModel>({
    id: 'release',
    name: (
      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
        Use '<PowerIcon />' (Check Release) button to verify release
      </Typography>
    ),
    checkCommand: '',
    detail: '',
    isLinuxCommand: false,
    status: AppStatus.Pending
  })

  const handleCheckRelease = async () => {
    try {
      setStatus((state) => ({ ...state, status: AppStatus.Checking, name: 'Checking release name' }))

      let typeValue: string | undefined = undefined

      if (localConfigs[Storage.KUBECONFIG_PATH]) {
        typeValue = localConfigs[Storage.KUBECONFIG_PATH]
      } else if (localConfigs[Storage.KUBECONFIG_TEXT]) {
        typeValue = Buffer.from(localConfigs[Storage.KUBECONFIG_TEXT], 'base64').toString()
      }

      const releaseExists = await WorkloadsService.checkReleaseName(
        localConfigs[Storage.RELEASE_NAME],
        localConfigs[Storage.KUBECONFIG_CONTEXT],
        localConfigs[Storage.KUBECONFIG_TYPE] as KubeconfigType,
        typeValue
      )

      if (releaseExists) {
        setStatus((state) => ({
          ...state,
          status: AppStatus.Configured,
          name: `'${localConfigs[Storage.RELEASE_NAME]}' release exists`
        }))
      } else {
        setStatus((state) => ({
          ...state,
          status: AppStatus.NotConfigured,
          name: `'${localConfigs[Storage.RELEASE_NAME]}' release does not exists`
        }))
      }
    } catch (err) {
      setStatus((state) => ({
        ...state,
        status: AppStatus.NotConfigured,
        name: `Failed to check release '${localConfigs[Storage.RELEASE_NAME]}'`,
        detail: err?.message ? err.message : err
      }))
    }
  }

  return (
    <Box sx={sx}>
      <Box display="flex" width="100%" alignItems="center">
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Release Name"
          value={localConfigs[Storage.RELEASE_NAME]}
          onChange={(event) => onChange(Storage.RELEASE_NAME, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleCheckRelease()
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" title="Check Release" disabled={loading} onClick={handleCheckRelease}>
                  <PowerIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <InfoTooltip
          ml={1}
          message={
            <Typography variant="body2">
              This is the name of your release in selected kubernetes deployment. It can be 'dev', 'prod', 'local', etc.
              <br />
              <br />
              Release name is used to prefix the workloads in your cluster like:
              <br />'{'{RELEASE_NAME}'}-etherealengine-client'. i.e. 'prod-etherealengine-client'
            </Typography>
          }
        />
      </Box>

      <StatusViewItem titleVariant="body2" titleSx={{ mt: 0.5 }} sx={{ mt: 2 }} status={status} />
    </Box>
  )
}

export default DeploymentView
