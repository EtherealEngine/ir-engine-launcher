import PageRoot from 'renderer/components/PageRoot'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { Button, Typography } from '@mui/material'
import { Box } from '@mui/system'

type RetryCallback = () => void

interface Props {
  error: string
  detail?: string
  retryText?: string
  onRetry?: RetryCallback
}

const ErrorPage = ({ error, detail, retryText, onRetry }: Props) => {
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
        <CancelOutlinedIcon sx={{ fontSize: 40, marginBottom: 1, color: 'red' }} />
        <Typography variant="h6" sx={{ marginBottom: 1 }}>
          {error}
        </Typography>
        {detail && (
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            {detail}
          </Typography>
        )}
        {onRetry && (
          <Button
            color="primary"
            variant="contained"
            startIcon={<CachedOutlinedIcon />}
            sx={{ marginTop: 1 }}
            onClick={onRetry}
          >
            {retryText ? retryText : 'Retry'}
          </Button>
        )}
      </Box>
    </PageRoot>
  )
}

export default ErrorPage
