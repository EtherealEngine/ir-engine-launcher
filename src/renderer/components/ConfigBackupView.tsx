import { useState } from 'react'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'

import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { Box, Button, FormControlLabel, SxProps, Theme, Typography } from '@mui/material'

import AlertDialog from './AlertDialog'
import InfoTooltip from './InfoTooltip'

interface Props {
  hasPendingChanges: boolean
  sx?: SxProps<Theme>
}

const ConfigBackupView = ({ hasPendingChanges, sx }: Props) => {
  const [showImportAlert, setImportAlert] = useState(false)
  const [showExportAlert, setExportAlert] = useState(false)
  const settingsState = useSettingsState()
  const { configs, vars } = settingsState.value

  const handleExport = async () => {
    if (hasPendingChanges) {
      setExportAlert(true)
    } else {
      await SettingsService.exportSettings()
    }
  }

  const handleImport = async () => {
    setImportAlert(false)
    await SettingsService.importSettings()
  }

  return (
    <Box sx={sx}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
        <FormControlLabel
          labelPlacement="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
              <Typography variant="body2">EXPORT SETTINGS</Typography>
              <InfoTooltip message="This will export all values from Configs and Variables tab to a json file." />
            </Box>
          }
          control={<></>}
          sx={{ marginTop: 2, marginLeft: 0 }}
        />
        <Button
          disabled={configs.loading || vars.loading}
          variant="contained"
          startIcon={<FileDownloadIcon />}
          sx={{ marginLeft: 4, width: 'auto', background: 'var(--purplePinkGradient)', ':hover': { opacity: 0.8 } }}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', mt: 6 }}>
        <FormControlLabel
          labelPlacement="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'top', flexDirection: 'row' }}>
              <Typography variant="body2">IMPORT SETTINGS</Typography>
              <InfoTooltip message="This will import/replace all values from json file to Configs and Variables tab." />
            </Box>
          }
          control={<></>}
          sx={{ marginTop: 2, marginLeft: 0 }}
        />
        <Button
          disabled={configs.loading || vars.loading}
          variant="contained"
          startIcon={<FileUploadIcon />}
          sx={{ marginLeft: 4, width: 'auto', background: 'var(--purplePinkGradient)', ':hover': { opacity: 0.8 } }}
          onClick={() => setImportAlert(true)}
        >
          Import
        </Button>
      </Box>

      {showImportAlert && (
        <AlertDialog
          title="Confirmation"
          message={
            <>
              <Typography>
                Are you sure you want to import configurations?{' '}
                <span style={{ color: 'red' }}>This will replace your existing configurations.</span>
              </Typography>
              <Typography sx={{ mt: 2, fontWeight: 300 }}>
                Its recommended to export/backup your existing configuration. As import is an irreversible step.
              </Typography>
            </>
          }
          okButtonText="Proceed"
          onClose={() => setImportAlert(false)}
          onOk={handleImport}
        />
      )}

      {showExportAlert && (
        <AlertDialog
          title="Confirmation"
          message="There are some pending changes. Please first save them before proceeding with export."
          onClose={() => setExportAlert(false)}
        />
      )}
    </Box>
  )
}

export default ConfigBackupView
