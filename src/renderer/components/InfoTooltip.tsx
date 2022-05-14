import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Tooltip, Typography } from '@mui/material'

interface Props {
  message: React.ReactNode
}

const InfoTooltip = ({ message }: Props) => {
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
      <InfoOutlinedIcon color="primary" sx={{ marginLeft: 2, fontSize: '18px' }} />
    </Tooltip>
  )
}

export default InfoTooltip
