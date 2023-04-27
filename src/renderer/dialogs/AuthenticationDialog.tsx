import { decryptPassword } from 'common/UtilitiesManager'
import Channels from 'constants/Channels'
import { useState } from 'react'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress
} from '@mui/material'

import AuthView from '../components/Config/AuthView'

interface Props {
  onClose: () => void
}

const AuthenticationDialog = ({ onClose }: Props) => {
  const settingsState = useSettingsState()
  const { sudoPassword } = settingsState.value

  const configFileState = useConfigFileState()
  const { loading } = configFileState.value

  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState(() => {
    const decrypted = decryptPassword(sudoPassword)
    return decrypted
  })

  const handleLogin = async () => {
    setLoading(true)
    const sudoLoggedIn = await window.electronAPI.invoke(Channels.Shell.CheckSudoPassword, password)
    setLoading(false)

    if (sudoLoggedIn) {
      SettingsService.setSudoPassword(password)
      setError('')
      onClose()
    } else {
      setError('Invalid password')
    }
  }

  const onChangePassword = (password: string) => {
    setPassword(password)
    setError('')
  }

  return (
    <Dialog open fullWidth maxWidth="sm">
      {(isLoading || loading) && <LinearProgress />}

      <DialogTitle>Authenticate</DialogTitle>

      <DialogContentText sx={{ margin: 3, marginBottom: 0 }}>
        Provide sudo admin password to authenticate
      </DialogContentText>

      {error && (
        <DialogContentText color={'red'} sx={{ marginLeft: 5, marginRight: 5 }}>
          Error: {error}
        </DialogContentText>
      )}

      <DialogContent sx={{ marginBottom: 3 }}>
        <AuthView
          password={password}
          sx={{ marginLeft: 2, marginRight: 2 }}
          onChange={onChangePassword}
          onEnter={handleLogin}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleLogin}>Login</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AuthenticationDialog
