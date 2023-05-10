import Storage from 'constants/Storage'
import { AppModel, AppStatus } from 'models/AppStatus'
import { useState } from 'react'
import { useConfigFileState } from 'renderer/services/ConfigFileService'

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
    name: "Use 'Check Release' button to verify release",
    checkCommand: '',
    detail: '',
    isLinuxCommand: false,
    status: AppStatus.Pending
  })

  const handleCheckRelease = async () => {
    setStatus((state) => ({ ...state, status: AppStatus.Checking, name: 'Checking release name' }))

    //TODO: Add handler to check release name.
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
          onBlur={handleCheckRelease}
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

      <StatusViewItem titleVariant="body2" titleSx={{ mt: 0.5 }} sx={{ mt: 2 }} verticalAlignTop status={status} />
    </Box>
  )
}

export default DeploymentView
