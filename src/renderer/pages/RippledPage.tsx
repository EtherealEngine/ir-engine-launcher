import { Channels } from 'constants/Channels'
import Endpoints from 'constants/Endpoints'
import { AppStatus } from 'models/AppStatus'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import InfoTooltip from 'renderer/components/InfoTooltip'
import PageRoot from 'renderer/components/PageRoot'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import PlaylistRemoveOutlinedIcon from '@mui/icons-material/PlaylistRemoveOutlined'
import { Box, IconButton, TextField, Typography } from '@mui/material'

import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

const RippledPage = () => {
  const outputEndRef = useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const [commandInput, setCommandInput] = useState<any>()
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [outputs, setOutputs] = useState<string[]>([])

  const deploymentState = useDeploymentState()
  const { appStatus } = deploymentState.value
  const rippledStatus = appStatus.find((app) => app.id === 'rippled')

  const onCommandChange = (value: string) => {
    setCommand(value)
  }

  const onCommandKey = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    try {
      if (!commandInput) {
        setCommandInput(event.currentTarget)
      }

      if (event.key === 'Enter' && event.shiftKey === false) {
        event.preventDefault()

        const output = await window.electronAPI.invoke(Channels.Shell.ExecuteRippledCommand, command)

        const newHistory = [...history, command]
        setOutputs([...outputs, `> ${command}`, output])
        setHistory(newHistory)
        setHistoryIndex(newHistory.length)
        setCommand('')
      } else if (event.key === 'ArrowUp') {
        const newIndex = historyIndex - 1

        if (newIndex < history.length && newIndex >= 0) {
          setCommand(history[newIndex])
          setHistoryIndex(newIndex)
        }
      } else if (event.key === 'ArrowDown') {
        const newIndex = historyIndex + 1

        if (newIndex < history.length) {
          setCommand(history[newIndex])
          setHistoryIndex(newIndex)
        }
      }
    } catch (err) {
      console.error(err)
      enqueueSnackbar!(`Failed execute command. ${err}`, {
        variant: 'error'
      })
    }
  }

  useEffect(() => {
    ;(outputEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' })
  }, [outputs])

  useEffect(() => {
    setTimeout(() => {
      if (commandInput) {
        const lengthOfInput = commandInput.value.length
        commandInput.setSelectionRange(lengthOfInput, lengthOfInput)
      }
    }, 50)
  }, [historyIndex])

  let loadingMessage = ''
  if (rippledStatus?.status === AppStatus.Checking) {
    loadingMessage = 'Checking Rippled'
  }

  let errorMessage = ''
  let errorDetail = ''
  let errorRetry = () => {}
  if (rippledStatus?.status === AppStatus.NotConfigured) {
    errorMessage = 'Rippled Not Configured'
    errorDetail = 'Please configure Rippled before trying again.'
    errorRetry = () => DeploymentService.fetchDeploymentStatus()
  }

  if (loadingMessage) {
    return <LoadingPage title={loadingMessage} />
  } else if (errorMessage) {
    return <ErrorPage error={errorMessage} detail={errorDetail} onRetry={errorRetry} />
  }

  return (
    <PageRoot>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row', marginTop: 1, marginBottom: 1 }}
        >
          <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex' }}>
            Rippled CLI
            <InfoTooltip
              message={
                <Typography variant="body2">
                  Here you can run rippled server cli commands.{' '}
                  <a href={Endpoints.RIPPLED_CLI_DOCS} target="_blank">
                    More Info
                  </a>
                </Typography>
              }
            />
          </Typography>
          <IconButton title="Clear Logs" color="primary" onClick={() => setOutputs([])}>
            <PlaylistRemoveOutlinedIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, ml: 2, mt: 1 }}>
          {outputs.map((output, index) => (
            <pre key={`output-${index}`}>{output}</pre>
          ))}
          <pre ref={outputEndRef} />
        </Box>
        <TextField
          label="Enter Command"
          placeholder="Enter command here..."
          value={command}
          maxRows={6}
          multiline
          onKeyDown={onCommandKey}
          onChange={(event) => onCommandChange(event.target.value)}
        />
      </Box>
    </PageRoot>
  )
}

export default RippledPage
