import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { SxProps, Theme, Tooltip, Typography } from '@mui/material'

interface Props {
  message: React.ReactNode
  ml?: number | string
  sx?: SxProps<Theme>
}

const InfoTooltip = ({ message, ml, sx }: Props) => {
  if (!ml) {
    ml = 2
  }

  return (
    <Tooltip
      title={
        <Typography variant="body2" sx={{ overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-line' }}>
          {message}
        </Typography>
      }
      arrow
    >
      <InfoOutlinedIcon color="primary" sx={{ ...sx, ml, fontSize: '18px' }} />
    </Tooltip>
  )
}

export default InfoTooltip
