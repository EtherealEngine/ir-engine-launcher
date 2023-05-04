import { AdditionalLogType } from 'models/Log'
import { useEffect, useRef, useState } from 'react'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { LogService, useLogState } from 'renderer/services/LogService'
import { useWorkloadsState, WorkloadsService } from 'renderer/services/WorkloadsService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import PlaylistRemoveOutlinedIcon from '@mui/icons-material/PlaylistRemoveOutlined'
import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography
} from '@mui/material'

const LogsView = () => {
  const [autoRefresh, setAutoRefresh] = useState('60')

  const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timer | undefined>(undefined)
  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const workloads = useWorkloadsState()
  const currentWorkloads = workloads.value.find((item) => item.clusterId === selectedClusterId)

  const logState = useLogState()
  const currentLogs = logState.value.find((item) => item.clusterId === selectedClusterId)
  const currentAdditionalLogs =
    currentLogs?.selectedAdditionalLogs === undefined
      ? undefined
      : currentLogs?.additionalLogs?.find((item) => item.id === currentLogs?.selectedAdditionalLogs)

  const logsEndRef = useRef(null)

  const scrollLogsToBottom = () => {
    ;(logsEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom of logs
  useEffect(() => {
    scrollLogsToBottom()
  }, [logState])

  //@ts-ignore
  useEffect(() => {
    if (autoRefresh !== '0') {
      const interval = setInterval(() => {
        handleRefreshWorkloadLogs()
      }, parseInt(autoRefresh) * 1000)
      setIntervalTimer(interval)
      return () => {
        if (interval) clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
      }
    } else if (intervalTimer) {
      clearInterval(intervalTimer)
      setIntervalTimer(undefined)
    }
  }, [autoRefresh])

  if (!selectedCluster) {
    return <></>
  }

  let containersMenu: string[] = []
  if (currentLogs?.selectedAdditionalLogs) {
    const containers = currentWorkloads?.workloads
      .find((item) => item.id === 'all')
      ?.pods.find((item) => item.name === currentLogs?.selectedAdditionalLogs?.split('/')[0])?.containers
    containersMenu =
      containers?.map((item) => {
        return item.name
      }) || []
  }

  const autoRefreshMenu: { value: string; label: string }[] = [
    {
      value: '0',
      label: 'None'
    },
    {
      value: '10',
      label: '10 seconds'
    },
    {
      value: '30',
      label: '30 seconds'
    },
    {
      value: '60',
      label: '1 minute'
    },
    {
      value: '300',
      label: '5 minutes'
    },
    {
      value: '600',
      label: '10 minutes'
    }
  ]

  const handleTabChange = async (_event: React.SyntheticEvent, newValue: string) => {
    LogService.setSelectedAdditionalLogs(selectedClusterId, newValue === 'config' ? undefined : newValue)
  }

  const handleCloseAdditionalLogs = async (id: string) => {
    LogService.removeAdditionalLogs(selectedClusterId, id)
    LogService.setSelectedAdditionalLogs(selectedClusterId, undefined)
  }

  const handleRefreshWorkloadLogs = () => {
    console.info('Refreshing workload logs.')

    const split = currentLogs?.selectedAdditionalLogs?.split('/')
    if (split) {
      WorkloadsService.getPodLogs(selectedCluster, split[0], split[1])
    }
  }

  const handleContainerChange = async (e) => {
    try {
      const { value } = e.target

      const split = currentLogs?.selectedAdditionalLogs?.split('/')
      if (currentLogs?.selectedAdditionalLogs && split) {
        await WorkloadsService.getPodLogs(selectedCluster, split[0], value)

        LogService.removeAdditionalLogs(selectedClusterId, currentLogs?.selectedAdditionalLogs)
        LogService.setSelectedAdditionalLogs(selectedClusterId, `${split[0]}/${value}`)
      }
    } catch {
      LogService.setSelectedAdditionalLogs(selectedClusterId, undefined)
    }
  }

  const handleAutoRefreshWorkloadLogsChange = (e) => {
    const { value } = e.target

    setAutoRefresh(value)
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row', marginTop: 1, marginBottom: 1 }}>
        <Typography variant="h5">Logs</Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, mr: 4 }}>
          {currentLogs?.additionalLogs?.length !== undefined && currentLogs?.additionalLogs?.length > 0 && (
            <Tabs
              value={currentLogs?.selectedAdditionalLogs || 'config'}
              variant="scrollable"
              scrollButtons="auto"
              onChange={handleTabChange}
            >
              <Tab
                value="config"
                sx={{ padding: 0 }}
                label={
                  <Box display="flex" flexDirection="row" alignItems="center">
                    <Typography variant="body2" sx={{ textTransform: 'none' }}>
                      Config
                    </Typography>
                  </Box>
                }
              />

              {currentLogs?.additionalLogs?.map((item) => (
                <Tab
                  value={item.id}
                  sx={{ padding: 0, margin: '0 5px' }}
                  label={
                    <Box display="flex" flexDirection="row" alignItems="center">
                      <Typography variant="body2" sx={{ textTransform: 'none' }}>
                        {item.label}
                      </Typography>
                      <IconButton
                        size="small"
                        title="Close"
                        color="primary"
                        sx={{ ml: '5px' }}
                        onClick={() => handleCloseAdditionalLogs(item.id)}
                      >
                        <CloseIcon sx={{ width: '18px' }} />
                      </IconButton>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          )}
        </Box>

        {containersMenu.length > 0 && (
          <FormControl margin="dense" size="small" sx={{ width: '200px' }}>
            <InputLabel id="container">Container</InputLabel>
            <Select
              labelId="container"
              label="Container"
              value={currentLogs?.selectedAdditionalLogs?.split('/')[1]}
              onChange={handleContainerChange}
            >
              {containersMenu.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ position: 'relative' }}>
          <IconButton
            title="Download Logs"
            color="primary"
            disabled={currentLogs?.isSaving}
            onClick={() => LogService.saveLogs(selectedClusterId)}
          >
            <DownloadIcon />
          </IconButton>
          {currentLogs?.isSaving && (
            <CircularProgress
              size={40}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
            />
          )}
        </Box>

        <IconButton title="Clear Logs" color="primary" onClick={() => LogService.clearLogs(selectedClusterId)}>
          <PlaylistRemoveOutlinedIcon />
        </IconButton>

        {currentAdditionalLogs?.type === AdditionalLogType.Workload && (
          <>
            <IconButton title="Refresh Logs" sx={{ marginRight: 1.5 }} onClick={handleRefreshWorkloadLogs}>
              <CachedOutlinedIcon />
            </IconButton>

            <FormControl margin="dense" size="small">
              <InputLabel id="logs-refresh">Auto Refresh</InputLabel>
              <Select
                labelId="logs-refresh"
                label="Auto Refresh"
                value={autoRefresh}
                onChange={handleAutoRefreshWorkloadLogsChange}
              >
                {autoRefreshMenu.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </Box>

      <Box sx={{ overflow: 'auto' }}>
        {(currentAdditionalLogs ? currentAdditionalLogs : currentLogs)?.logs.map((log, index) => (
          <pre key={`log-${index}`}>
            {new Date(log.date).toLocaleTimeString()}: {log.category} - {log.message}
          </pre>
        ))}
        <pre ref={logsEndRef} />
      </Box>
    </Box>
  )
}

export default LogsView
