import { useRef, useState } from 'react'
import { LogService, useLogState } from 'renderer/services/LogService'
import { useHookedEffect } from 'renderer/services/useHookedEffect'

import DownloadIcon from '@mui/icons-material/Download'
import PlaylistRemoveOutlinedIcon from '@mui/icons-material/PlaylistRemoveOutlined'
import { Box, CircularProgress, FormControlLabel, IconButton, Switch, Typography } from '@mui/material'

const LogsView = () => {
  const [showLogs, setShowLogs] = useState(true)

  const logState = useLogState()
  const { isSavingLogs, logs } = logState.value

  const logsEndRef = useRef(null)

  const scrollLogsToBottom = () => {
    ;(logsEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom of logs
  useHookedEffect(() => {
    scrollLogsToBottom()
  }, [logState.logs, showLogs])

  return (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row', marginTop: 1, marginBottom: 1 }}>
        <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex' }}>
          Logs
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <IconButton title="Download Logs" color="primary" disabled={isSavingLogs} onClick={LogService.saveLogs}>
            <DownloadIcon />
          </IconButton>
          {isSavingLogs && (
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
        <IconButton title="Clear Logs" color="primary" onClick={LogService.clearLogs}>
          <PlaylistRemoveOutlinedIcon />
        </IconButton>
        <FormControlLabel
          value={showLogs}
          control={<Switch defaultChecked color="primary" />}
          label={showLogs ? 'Hide Logs' : 'Show Logs'}
          labelPlacement="start"
          onChange={(_event, checked) => setShowLogs(checked)}
        />
      </Box>
      {showLogs && (
        <Box sx={{ overflow: 'auto' }}>
          {logs.map((log, index) => (
            <pre key={`log-${index}`}>
              {new Date(log.date).toLocaleTimeString()}: {log.category} - {log.message}
            </pre>
          ))}
          <pre ref={logsEndRef} />
        </Box>
      )}
    </Box>
  )
}

export default LogsView
