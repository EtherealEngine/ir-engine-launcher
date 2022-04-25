import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Box, SxProps, Theme, Typography } from '@mui/material'

interface Props {
  localPaths: Record<string, string>
  localVars: Record<string, string>
  localConfigs: Record<string, string>
  sx?: SxProps<Theme>
}

const ConfigSummaryView = ({ localPaths, localVars, localConfigs, sx }: Props) => {
  return (
    <Box sx={sx}>
      <Typography sx={{ display: 'flex', fontWeight: 'bold' }}>
        Authentication: <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 20, color: 'limegreen' }} />
      </Typography>

      <Typography sx={{ display: 'flex', fontWeight: 'bold', marginTop: 2, marginBottom: 0.5 }}>
        Configs: <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 20, color: 'limegreen' }} />
      </Typography>
      {Object.keys(localPaths).map((key) => (
        <Typography key={key} variant="body2">
          <span style={{ opacity: 0.5 }}>{key.replaceAll('_', ' ')}:</span> {localPaths[key]}
        </Typography>
      ))}
      {Object.keys(localConfigs).map((key) => (
        <Typography key={key} variant="body2">
          <span style={{ opacity: 0.5 }}>{key.replaceAll('_', ' ')}:</span> {localConfigs[key]}
        </Typography>
      ))}

      <Typography sx={{ display: 'flex', fontWeight: 'bold', marginTop: 2, marginBottom: 0.5 }}>
        Variables: <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 20, color: 'limegreen' }} />
      </Typography>
      {Object.keys(localVars).map((key) => (
        <Typography key={key} variant="body2">
          <span style={{ opacity: 0.5 }}>{key.replaceAll('_', ' ')}:</span> {localVars[key]}
        </Typography>
      ))}
    </Box>
  )
}

export default ConfigSummaryView
