import Storage from 'constants/Storage'

import { Box, FormControlLabel, Switch, SxProps, Theme, Typography } from '@mui/material'

import InfoTooltip from '../../common/InfoTooltip'

interface Props {
  localFlags: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const AdditionalConfigsView = ({ localFlags, onChange, sx }: Props) => {
  return (
    <Box sx={sx}>
      <FormControlLabel
        labelPlacement="start"
        label={
          <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
            <Typography variant="body2">{Storage.SHOW_ALL_BRANCHES.replaceAll('_', ' ')}</Typography>
            <InfoTooltip message="This will show all Ethereal Engine branches. If switched off then it will show only dev & master branches." />
          </Box>
        }
        sx={{ marginTop: 1, marginLeft: 0 }}
        control={<Switch checked={localFlags[Storage.SHOW_ALL_BRANCHES] === 'true'} sx={{ marginLeft: 4 }} />}
        value={localFlags[Storage.SHOW_ALL_BRANCHES] === 'true'}
        onChange={(_event, checked) => onChange(Storage.SHOW_ALL_BRANCHES, checked ? 'true' : 'false')}
      />
    </Box>
  )
}

export default AdditionalConfigsView
