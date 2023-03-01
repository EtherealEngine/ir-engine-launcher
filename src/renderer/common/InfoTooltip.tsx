import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Tooltip, Typography } from '@mui/material'

interface Props {
  message: React.ReactNode
  ml?: number | string
}

const InfoTooltip = ({ message, ml }: Props) => {
  if (!ml) {
    ml = 2
  }

  return (
    <Tooltip
      title={
        <Typography
          variant="body2"
          color="inherit"
          sx={{ overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-line' }}
        >
          {message}
        </Typography>
      }
      arrow
    >
      <InfoOutlinedIcon color="primary" sx={{ ml, fontSize: '18px' }} />
    </Tooltip>
  )
}

export default InfoTooltip
