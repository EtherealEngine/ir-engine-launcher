import React from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface Props {
  title: string
  message: React.ReactNode
  okButtonText?: string
  cancelButtonText?: string
  onClose: () => void
  onOk?: () => void
}

const AlertDialog = ({ title, message, okButtonText, cancelButtonText, onClose, onOk }: Props) => {
  if (!okButtonText) {
    okButtonText = 'Ok'
  }

  if (!cancelButtonText) {
    cancelButtonText = 'Cancel'
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {React.isValidElement(message) === false && <DialogContentText>{message}</DialogContentText>}
        {React.isValidElement(message) && message}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelButtonText}</Button>
        {onOk && (
          <Button onClick={onOk} autoFocus>
            {okButtonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default AlertDialog
