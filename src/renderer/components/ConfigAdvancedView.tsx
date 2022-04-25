import Storage from 'constants/Storage'

import { Box, FormControlLabel, Switch, SxProps, Theme } from '@mui/material'

interface Props {
  localConfigs: Record<string, string>
  onChange: (key: string, value: string) => void
  sx?: SxProps<Theme>
}

const ConfigAdvancedView = ({ localConfigs, onChange, sx }: Props) => {
  return (
    <Box sx={sx}>
      <FormControlLabel
        labelPlacement="start"
        label={Storage.FORCE_DB_REFRESH.replaceAll('_', ' ')}
        sx={{ marginTop: 2, marginLeft: 0 }}
        control={<Switch defaultChecked={false} sx={{ marginLeft: 2 }} />}
        value={localConfigs[Storage.FORCE_DB_REFRESH] === 'true'}
        onChange={(_event, checked) => onChange(Storage.FORCE_DB_REFRESH, checked ? 'true' : 'false')}
      />
    </Box>
  )
}

export default ConfigAdvancedView
