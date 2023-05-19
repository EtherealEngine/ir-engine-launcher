import Storage from 'constants/Storage'

import { Box, FormControlLabel, Switch, SxProps, Theme, Typography } from '@mui/material'

import InfoTooltip from '../../common/InfoTooltip'

interface Props {
  localFlags: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const FlagsView = ({ localFlags, onChange, sx }: Props) => {
  return (
    <Box sx={sx}>
      <FormControlLabel
        labelPlacement="start"
        label={
          <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
            <Typography variant="body2">{Storage.FORCE_DB_REFRESH.replaceAll('_', ' ')}</Typography>
            <InfoTooltip message="This will reinitialize the database associated with the deployment." />
          </Box>
        }
        sx={{ marginTop: 1, marginLeft: 0 }}
        control={<Switch checked={localFlags[Storage.FORCE_DB_REFRESH] === 'true'} sx={{ marginLeft: 4 }} />}
        value={localFlags[Storage.FORCE_DB_REFRESH] === 'true'}
        onChange={(_event, checked) => onChange(Storage.FORCE_DB_REFRESH, checked ? 'true' : 'false')}
      />
    </Box>
  )
}

export default FlagsView
