import PageRoot from 'renderer/components/PageRoot'

import { Box, CircularProgress, Typography } from '@mui/material'
import { Variant } from '@mui/material/styles/createTypography'

interface Props {
  title: string
  isInPage?: boolean
  variant?: Variant
}

const LoadingPage = ({ title, isInPage, variant }: Props) => {
  if (!variant) {
    variant = 'h6'
  }

  const content = (
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
      <Typography variant={variant}>{title}</Typography>
    </Box>
  )

  if (isInPage) {
    return content
  }

  return <PageRoot>{content}</PageRoot>
}

export default LoadingPage
