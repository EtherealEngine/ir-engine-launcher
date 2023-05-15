import { ClusterType } from 'models/Cluster'

import { Box, FormControl, InputLabel, MenuItem, Select, SxProps, TextField, Theme } from '@mui/material'

interface Props {
  name: string
  type: ClusterType
  sx?: SxProps<Theme>
  onNameChange: (name: string) => void
  onTypeChange: (type: ClusterType) => void
}

const ClusterView = ({ name, type, sx, onNameChange, onTypeChange }: Props) => {
  return (
    <Box sx={sx}>
      <TextField
        fullWidth
        margin="dense"
        size="small"
        label="Cluster Name"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />

      <FormControl fullWidth margin="dense" size="small">
        <InputLabel id="cluster-type-label">Cluster Type</InputLabel>
        <Select
          labelId="cluster-type-label"
          label="Cluster Type"
          value={type}
          onChange={(event) => {
            const value = event.target.value.toString()
            const type = value as ClusterType
            onTypeChange(type)
          }}
        >
          {Object.keys(ClusterType)
            .filter((key) => isNaN(Number(key)))
            .map((item) => (
              <MenuItem key={item} value={item}>
                {ClusterType[item]}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default ClusterView
