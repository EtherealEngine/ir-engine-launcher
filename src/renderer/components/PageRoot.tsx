import { PropsWithChildren } from 'react'

import { Box } from '@mui/material'

interface Props {
  full?: boolean
  noNav?: boolean
}

const PageRoot = ({ full, noNav, children }: PropsWithChildren<Props>) => {
  let navHeight = '118px'
  let padding = 3

  if (full) {
    navHeight = '70px'
    padding = 0
  }

  if (noNav) {
    navHeight = '0px'
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: `calc(100vh - ${navHeight})`,
        bgcolor: 'var(--purpleDarkest)',
        color: 'var(--text)',
        p: padding
      }}
    >
      {children}
    </Box>
  )
}

export default PageRoot
