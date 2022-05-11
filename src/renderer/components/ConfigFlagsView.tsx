import Storage from 'constants/Storage'

import { Box, FormControlLabel, Switch, SxProps, Theme } from '@mui/material'

interface Props {
  localFlags: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const ConfigFlagsView = ({ localFlags, onChange, sx }: Props) => {
  return (
    <Box sx={sx}>
      <FormControlLabel
        labelPlacement="start"
        label={Storage.FORCE_DB_REFRESH.replaceAll('_', ' ')}
        sx={{ marginTop: 2, marginLeft: 0 }}
        control={<Switch checked={localFlags[Storage.FORCE_DB_REFRESH] === 'true'} sx={{ marginLeft: 2 }} />}
        value={localFlags[Storage.FORCE_DB_REFRESH] === 'true'}
        onChange={(_event, checked) => onChange(Storage.FORCE_DB_REFRESH, checked ? 'true' : 'false')}
      />
    </Box>
  )
}

export default ConfigFlagsView
