import PageRoot from 'renderer/components/PageRoot'

import { CircularProgress, Typography } from '@mui/material'
import { Box } from '@mui/system'

interface Props {
  title: string
}

const LoadingPage = ({ title }: Props) => {
  return (
    <PageRoot>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={40} sx={{ marginBottom: 1 }} />
        <Typography variant="h6">{title}</Typography>
      </Box>
    </PageRoot>
  )
}

export default LoadingPage
