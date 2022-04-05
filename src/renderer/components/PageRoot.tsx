import { PropsWithChildren } from 'react'

import { Box } from '@mui/system'

interface Props {
  full?: boolean
}

const PageRoot = ({ full, children }: PropsWithChildren<Props>) => {
  if (full) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 69px)',
          bgcolor: 'background.default',
          color: 'text.primary'
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
        height: 'calc(100vh - 117px)',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 3
      }}
    >
      {children}
    </Box>
  )
}

export default PageRoot
