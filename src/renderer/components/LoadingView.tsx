import { CircularProgress, Typography } from '@mui/material'
import { Box } from '@mui/system'

interface Props {
  title: string
}

const LoadingView = ({ title }: Props) => {
  return (
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
  )
}

export default LoadingView
