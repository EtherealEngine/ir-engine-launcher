import { Buffer } from 'buffer'
import Storage from 'constants/Storage'
import { ClusterType } from 'models/Cluster'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Box, SxProps, Theme, Typography } from '@mui/material'

interface Props {
  name?: string
  type?: ClusterType
  localConfigs: Record<string, string>
  localVars: Record<string, string>
  localFlags: Record<string, string>
  sx?: SxProps<Theme>
}

const SummaryView = ({ name, type, localConfigs, localVars, localFlags, sx }: Props) => {
  const processConfigValue = (key: string, value: string) => {
    if (key === Storage.KUBECONFIG_TEXT) {
      value = `\n${Buffer.from(value || '', 'base64').toString()}`
    }

    return value
  }

  return (
    <Box sx={sx}>
      {type !== ClusterType.Custom && (
        <Typography sx={{ display: 'flex', fontWeight: 'bold' }}>
          Authentication: <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 20, fill: 'limegreen' }} />
        </Typography>
      )}

      {name && type && (
        <>
          <Typography sx={{ display: 'flex', fontWeight: 'bold', marginTop: 2, marginBottom: 0.5 }}>
            Cluster: <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 20, fill: 'limegreen' }} />
          </Typography>
          <Typography variant="body2">
            <span style={{ opacity: 0.5 }}>Cluster Name:</span> {name}
          </Typography>
          <Typography variant="body2">
            <span style={{ opacity: 0.5 }}>Cluster Type:</span> {type}
          </Typography>
        </>
      )}
      <Typography sx={{ display: 'flex', fontWeight: 'bold', marginTop: 2, marginBottom: 0.5 }}>
        Configs: <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 20, fill: 'limegreen' }} />
      </Typography>
      {Object.keys(localConfigs)
        .sort()
        .map((key) => (
          <Typography key={key} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            <span style={{ opacity: 0.5 }}>{key.replaceAll('_', ' ')}:</span>{' '}
            {processConfigValue(key, localConfigs[key])}
          </Typography>
        ))}
      {Object.keys(localFlags)
        .sort()
        .map((key) => (
          <Typography key={key} variant="body2">
            <span style={{ opacity: 0.5 }}>{key.replaceAll('_', ' ')}:</span> {localFlags[key]}
          </Typography>
        ))}

      {Object.keys(localVars).length > 0 && (
        <Typography sx={{ display: 'flex', fontWeight: 'bold', marginTop: 2, marginBottom: 0.5 }}>
          Variables: <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 20, fill: 'limegreen' }} />
        </Typography>
      )}
      {Object.keys(localVars).map((key) => (
        <Typography key={key} variant="body2">
          <span style={{ opacity: 0.5 }}>{key.replaceAll('_', ' ')}:</span> {localVars[key]}
        </Typography>
      ))}
    </Box>
  )
}

export default SummaryView
