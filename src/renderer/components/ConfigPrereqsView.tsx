import Endpoints from 'constants/Endpoints'
import { AppModel, AppStatus } from 'models/AppStatus'
import { OSType } from 'models/AppSysInfo'
import { useEffect, useState } from 'react'
import { SettingsService, useSettingsState } from 'renderer/services/SettingsService'

import { Box, SxProps, Theme, Typography } from '@mui/material'

import { StatusViewItem } from './StatusView'

interface Props {
  onChange: (value: boolean) => void
  sx?: SxProps<Theme>
}

const ConfigPrereqsView = ({ onChange, sx }: Props) => {
  const [statuses, setStatuses] = useState<AppModel[]>([])
  const settingsState = useSettingsState()
  const { appSysInfo } = settingsState.value

  useEffect(() => {
    loadPrerequisites()
  }, [])

  const loadPrerequisites = async () => {
    // Callback to disable next button in dialog
    onChange(false)

    // load and display prerequisites with loading status
    const initialStatuses = await SettingsService.getPrerequisites()
    setStatuses(initialStatuses)

    const checkedStatuses = [...initialStatuses]

    for (const status of initialStatuses) {
      // Display prerequisite with checked status
      const checkedStatus = await SettingsService.CheckPrerequisite(status)

      // Add description for corrective actions to be displayed in dialog
      if (checkedStatus.status !== AppStatus.Configured) {
        processDescriptions(checkedStatus)
      }

      const currentIndex = initialStatuses.findIndex((item) => item.id === status.id)
      checkedStatuses[currentIndex] = checkedStatus

      setStatuses(checkedStatuses)
    }

    const allConfigured =
      checkedStatuses.length > 0 && checkedStatuses.every((item) => item.status === AppStatus.Configured)

    // Callback to enabled next button in dialog
    onChange(allConfigured)
  }

  const processDescriptions = (status: AppModel) => {
    if (status.id === 'wsl' || status.id === 'wslUbuntu') {
      status.description = (
        <Typography fontSize={14}>
          <span style={{ fontSize: 14, opacity: 0.6 }}>
            Make sure WSL is installed and Ubuntu is selected as default distribution.{' '}
          </span>
          <a style={{ color: 'white' }} target="_blank" href={Endpoints.Docs.INSTALL_WSL}>
            Install WSL
          </a>
          .
        </Typography>
      )
    } else if (status.id === 'dockerDesktop' || status.id === 'dockerDesktopUbuntu') {
      status.description = (
        <Typography fontSize={14}>
          <span style={{ fontSize: 14, opacity: 0.6 }}>
            Make sure Docker Desktop is installed and Ubuntu WSL Integration is enabled.{' '}
          </span>
          <a style={{ color: 'white' }} target="_blank" href={Endpoints.Docs.INSTALL_DOCKER}>
            Install Docker Desktop
          </a>
          .
        </Typography>
      )
    }
  }

  if (appSysInfo.osType !== OSType.Windows) {
    return <></>
  }

  return (
    <Box sx={sx}>
      <Typography mt={2} mb={1}>
        Prerequisites:
      </Typography>

      {statuses.map((status) => (
        <StatusViewItem key={status.id} titleVariant="body2" status={status} />
      ))}
    </Box>
  )
}

export default ConfigPrereqsView
