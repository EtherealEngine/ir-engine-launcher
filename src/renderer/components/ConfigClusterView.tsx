import { ClusterType } from 'models/Cluster'

import { Box, Divider, FormControl, InputLabel, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, SxProps, TextField, Theme } from '@mui/material'
import { KeyboardArrowDown } from '@mui/icons-material'
import { useState } from 'react'

interface Props {
  preset: number
  presets: any[]
  onPresetChange: (preset: number) => void

  id: string
  onIdChange: (id: string) => void

  name: string
  onNameChange: (name: string) => void

  type: ClusterType
  onTypeChange: (type: ClusterType) => void

  user: string
  onUserChange: (user: string) => void

  context: string
  onContextChange: (context: string) => void

  namespace: string
  onNamespaceChange: (namespace: string) => void

  url: string
  onUrlChange: (url: string) => void

  sx?: SxProps<Theme>
}

const ConfigClusterView = ({
  preset,
  presets,
  onPresetChange,
  
  id,
  onIdChange,

  name,
  onNameChange,

  type,
  onTypeChange,

  user,
  onUserChange,

  context,
  onContextChange,

  namespace,
  onNamespaceChange,

  url,
  onUrlChange,

  sx,

}: Props) => {
  const [open, setOpen] = useState(false)
  
  return (
    <>
    <Box sx={sx}>
      <TextField
        fullWidth
        margin="dense"
        size="small"
        label="Short Name"
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
                {item}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
    <Divider />
    <Box
      sx={{
        // bgcolor: open ? 'rgba(71, 98, 130, 0.2)' : null,
        pb: open ? 2 : 0,
      }}
    >
      <ListItemButton
        alignItems="flex-start"
        onClick={() => setOpen(!open)}
        sx={{
          px: 3,
          pt: 2.5,
          pb: open ? 0 : 2.5,
          '&:hover, &:focus': { '& svg': { opacity: open ? 1 : 0 } },
        }}
      >
        <ListItemText
          primary="Advanced Settings"
          primaryTypographyProps={{
            fontSize: 15,
            fontWeight: 'medium',
            lineHeight: '20px',
            mb: '2px',
          }}
          secondary="Name, User, Context, Namespace, etc."
          secondaryTypographyProps={{
            noWrap: true,
            fontSize: 12,
            lineHeight: '16px',
            color: open ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.5)',
          }}
          sx={{ my: 0 }}
        />
        <KeyboardArrowDown
          sx={{
            mr: -1,
            opacity: 0,
            transform: open ? 'rotate(-180deg)' : 'rotate(0)',
            transition: '0.2s',
          }}
        />
      </ListItemButton>
      {open &&
      <div style={ {width: '100%' }}>
            <InputLabel id="preset-label">Preset</InputLabel>
            <Select
              style={ {width: '100%' }}
              labelId="preset-label"
              label="Preset"
              value={preset}
              onChange={(event) => {
                onPresetChange(event.target.value as number)
              }}
            >
              {presets
                // .filter((key) => isNaN(Number(key)))
                .map(({ name }, idx ) => (
                  <MenuItem key={name} value={idx}>
                    {name}
                  </MenuItem>
                ))}
            </Select>
          <hr />
          <ListItem
            sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
          >
            <TextField
              fullWidth
              margin="dense"
              size="small"
              label="Cluster ID"
              value={id}
              onChange={(event) => onIdChange(event.target.value)}
            />
          </ListItem>
          <ListItem
          sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
        >
          <TextField
            fullWidth
            margin="dense"
            size="small"
            label="User"
              value={user}
            onChange={(event) => onUserChange(event.target.value)}
          />
        </ListItem>
        <ListItem
        sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
      >
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Context"
          value={context}
          onChange={(event) => onContextChange(event.target.value)}
        />
      </ListItem>
      <ListItem
        sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
      >
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Namespace"
          value={namespace}
          onChange={(event) => onNamespaceChange(event.target.value)}
        />
      </ListItem>
      <ListItem
        sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
      >
        <TextField
          fullWidth
          margin="dense"
          size="small"
          label="Server URL"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
        />
      </ListItem>
      </div>
      }
    </Box>
    </>
  )
}

export default ConfigClusterView
