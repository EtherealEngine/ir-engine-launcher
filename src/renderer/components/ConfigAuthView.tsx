import { useState } from 'react'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Box, IconButton, InputAdornment, SxProps, TextField, Theme } from '@mui/material'

interface Props {
  password: string
  sx?: SxProps<Theme>
  onChange: (password: string) => void
  onEnter: () => void
}

const ConfigAuthView = ({ password, sx, onChange, onEnter }: Props) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Box sx={sx}>
      <TextField
        autoFocus
        fullWidth
        margin="dense"
        label="Sudo Password"
        variant="standard"
        value={password}
        type={showPassword ? 'text' : 'password'}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onEnter()
          }
        }}
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
    </Box>
  )
}

export default ConfigAuthView
