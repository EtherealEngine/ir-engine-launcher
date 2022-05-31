import PageRoot from 'renderer/components/PageRoot'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { Box, Button, Typography } from '@mui/material'
import { Variant } from '@mui/material/styles/createTypography'

type RetryCallback = () => void

interface Props {
  error: string
  detail?: string
  retryText?: string
  isInPage?: boolean
  variant?: Variant
  bodyVariant?: Variant
  onRetry?: RetryCallback
}

const ErrorPage = ({ error, detail, retryText, isInPage, variant, bodyVariant, onRetry }: Props) => {
  if (!variant) {
    variant = 'h6'
  }
  if (!bodyVariant) {
    bodyVariant = 'body2'
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
      <CancelOutlinedIcon sx={{ fontSize: 40, marginBottom: 1, color: 'red' }} />
      <Typography variant={variant} sx={{ marginBottom: 1 }}>
        {error}
      </Typography>
      {detail && (
        <Typography variant={bodyVariant} sx={{ marginBottom: 1 }}>
          {detail}
        </Typography>
      )}
      {onRetry && (
        <Button
          color="primary"
          variant="contained"
          startIcon={<CachedOutlinedIcon />}
          sx={{ marginTop: 1, background: 'var(--purplePinkGradient)', ':hover': { opacity: 0.8 } }}
          onClick={onRetry}
        >
          {retryText ? retryText : 'Retry'}
        </Button>
      )}
    </Box>
  )

  if (isInPage) {
    return content
  }

  return <PageRoot>{content}</PageRoot>
}

export default ErrorPage
