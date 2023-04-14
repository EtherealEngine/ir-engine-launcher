import Channels from 'constants/Channels'
import { SnackbarKey, useSnackbar } from 'notistack'
import { Fragment } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { Button, IconButton } from '@mui/material'

export const openPathAction = (key: SnackbarKey, path: string) => {
  const { closeSnackbar } = useSnackbar()
  const content = (
    <Fragment>
      <Button
        sx={{ color: 'white' }}
        onClick={() => {
          window.electronAPI.invoke(Channels.Utilities.OpenPath, path)
          closeSnackbar(key)
        }}
      >
        Open
      </Button>
    </Fragment>
  )

  return defaultAction(key, content)
}

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  const { closeSnackbar } = useSnackbar()

  return (
    <Fragment>
      {content}
      <IconButton onClick={() => closeSnackbar(key)}>
        <CloseIcon sx={{ fill: 'white' }} />
      </IconButton>
    </Fragment>
  )
}
