import { Channels } from 'constants/Channels'
import { useState } from 'react'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField
} from '@mui/material'

interface Props {
  onClose: (result: boolean) => void
}

const SudoPasswordDialog = ({ onClose }: Props) => {
  const [isLoading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')

  const passwordChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPassword(event.target.value)
    setError('')
  }

  const validatePassword = async () => {
    setLoading(true)
    const sudoLoggedIn = await window.electronAPI.invoke(Channels.Shell.CheckSudoPassword, password)
    if (sudoLoggedIn) {
      onClose(true)
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={() => onClose(false)}>
      {isLoading && <LinearProgress />}
      <DialogTitle>Authentication</DialogTitle>
      <DialogContent>
        <DialogContentText>Please enter sudo admin password here.</DialogContentText>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Sudo Password"
          variant="standard"
          value={password}
          type={showPassword ? 'text' : 'password'}
          error={error ? true : false}
          helperText={error ? error : undefined}
          onChange={(event) => passwordChange(event)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button disabled={isLoading} onClick={validatePassword}>
          Validate
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SudoPasswordDialog
