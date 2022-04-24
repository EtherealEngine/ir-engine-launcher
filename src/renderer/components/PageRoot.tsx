import { PropsWithChildren } from 'react'

import { Box } from '@mui/material'

interface Props {
  full?: boolean
}

const PageRoot = ({ full, children }: PropsWithChildren<Props>) => {
  if (full) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 70px)',
          bgcolor: 'var(--purpleDarkest)',
          color: 'var(--text)'
        }}
      >
        {children}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 118px)',
        bgcolor: 'var(--purpleDarkest)',
        color: 'var(--text)',
        p: 3
      }}
    >
      {children}
    </Box>
  )
}

export default PageRoot
