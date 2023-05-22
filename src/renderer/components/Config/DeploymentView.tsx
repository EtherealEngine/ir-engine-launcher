import Storage from 'constants/Storage'
import { FetchableItem } from 'models/FetchableItem'
import { KubeconfigType } from 'models/Kubeconfig'
import { useEffect, useState } from 'react'
import InfoTooltip from 'renderer/common/InfoTooltip'
import LoadingPage from 'renderer/pages/LoadingPage'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { WorkloadsService } from 'renderer/services/WorkloadsService'

import { Box, FormControl, InputLabel, MenuItem, Select, SxProps, Theme, Typography } from '@mui/material'

interface Props {
  localConfigs: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const defaultReleasesState = {
  data: [],
  loading: true,
  error: ''
}

const DeploymentView = ({ localConfigs, onChange, sx }: Props) => {
  const [releaseNames, setReleaseNames] = useState<FetchableItem<string[]>>(defaultReleasesState)
  const configFileState = useConfigFileState()
  const { loading } = configFileState.value

  useEffect(() => {
    let typeValue: string | undefined = undefined

    if (localConfigs[Storage.KUBECONFIG_PATH]) {
      typeValue = localConfigs[Storage.KUBECONFIG_PATH]
    } else if (localConfigs[Storage.KUBECONFIG_TEXT]) {
      typeValue = Buffer.from(localConfigs[Storage.KUBECONFIG_TEXT], 'base64').toString()
    }

    loadReleaseNames(typeValue)
  }, [])

  const loadReleaseNames = async (typeValue?: string) => {
    try {
      setReleaseNames(defaultReleasesState)

      const releases = await WorkloadsService.getReleaseNames(
        localConfigs[Storage.KUBECONFIG_CONTEXT],
        localConfigs[Storage.KUBECONFIG_TYPE] as KubeconfigType,
        typeValue
      )

      setReleaseNames({
        data: releases,
        loading: false,
        error: ''
      })
    } catch (err) {
      setReleaseNames({
        data: [],
        loading: false,
        error: err
      })
    }
  }

  return (
    <Box sx={sx}>
      {releaseNames.loading && <LoadingPage title="Loading release names" variant="body2" isInPage sx={{ mt: 2 }} />}

      {!releaseNames.loading && (
        <Box display="flex" width="100%" alignItems="center">
          <FormControl fullWidth margin="dense" size="small" disabled={loading || releaseNames.data.length === 0}>
            <InputLabel id="release-names-label">Release Name</InputLabel>
            <Select
              labelId="release-names-label"
              label="Release Name"
              value={localConfigs[Storage.RELEASE_NAME]}
              onChange={(event) => {
                onChange(Storage.RELEASE_NAME, event.target.value)
              }}
            >
              {releaseNames.data.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <InfoTooltip
            ml={1}
            message={
              <Typography variant="body2">
                This is the name of your release in selected kubernetes deployment. It can be 'dev', 'prod', 'local',
                etc.
                <br />
                <br />
                Release name is used to prefix the workloads in your cluster like:
                <br />'{'{RELEASE_NAME}'}-etherealengine-client'. i.e. 'prod-etherealengine-client'
              </Typography>
            }
          />
        </Box>
      )}
    </Box>
  )
}

export default DeploymentView
