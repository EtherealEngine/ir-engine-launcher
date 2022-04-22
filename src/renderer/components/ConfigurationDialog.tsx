import { Channels } from 'constants/Channels'
import { useState } from 'react'
import { useSettingsState } from 'renderer/services/SettingsService'

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AppsIcon from '@mui/icons-material/Apps'
import FolderIcon from '@mui/icons-material/Folder'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Step,
  StepLabel,
  Stepper
} from '@mui/material'
import { StepIconProps } from '@mui/material/StepIcon'

import { ColorlibConnector, ColorlibStepIconRoot } from './Colorlib'
import ConfigAuthView from './ConfigAuthView'
import ConfigPathsView from './ConfigPathsView'
import ConfigVarsView from './ConfigVarsView'

const ColorlibStepIcon = (props: StepIconProps) => {
  const { active, completed, className } = props

  const icons: { [index: string]: React.ReactElement } = {
    1: <AdminPanelSettingsIcon />,
    2: <FolderIcon />,
    3: <AppsIcon />,
    4: <PlaylistAddCheckIcon />
  }

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  )
}
interface Props {
  onClose: () => void
}

const ConfigurationDialog = ({ onClose }: Props) => {
  const settingsState = useSettingsState()
  const { configPaths, configVars } = settingsState.value

  const [activeStep, setActiveStep] = useState(0)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [tempPaths, setTempPaths] = useState({} as Record<string, string>)
  const [tempVars, setTempVars] = useState({} as Record<string, string>)

  const handleNext = async () => {
    if (activeStep === 0) {
      setLoading(true)
      const sudoLoggedIn = await window.electronAPI.invoke(Channels.Shell.CheckSudoPassword, password)
      setLoading(false)
      if (!sudoLoggedIn) {
        setError('Invalid password')
        return
      }
    } else if (activeStep === 2) {
      for (const key in configVars.vars) {
        if (!configVars.vars[key] && !tempVars[key]) {
          setError('Please provide value for all variables')
          return
        }
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setError('')
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
    setError('')
  }

  const onChangePath = async (key: string, value: string) => {
    const newPaths = { ...tempPaths }
    newPaths[key] = value
    setTempPaths(newPaths)
    setError('')
  }

  const onChangeVar = async (key: string, value: string) => {
    const newVars = { ...tempVars }
    newVars[key] = value
    setTempVars(newVars)
    setError('')
  }

  const onChangePassword = (password: string) => {
    setPassword(password)
    setError('')
  }

  const steps = [
    {
      label: 'Authenticate',
      title: 'Provide sudo admin password to authenticate',
      content: (
        <ConfigAuthView
          password={password}
          sx={{ marginLeft: 2, marginRight: 2 }}
          onChange={onChangePassword}
          onEnter={handleNext}
        />
      )
    },
    {
      label: 'Paths',
      title: 'Provide configuration paths',
      content: <ConfigPathsView localPaths={tempPaths} sx={{ marginLeft: 2, marginRight: 2 }} onChange={onChangePath} />
    },
    {
      label: 'Variable',
      title: 'Provide configuration variables',
      content: <ConfigVarsView localVars={tempVars} sx={{ marginLeft: 2, marginRight: 2 }} onChange={onChangeVar} />
    },
    {
      label: 'Summary',
      title: '',
      content: <div />
    }
  ]

  return (
    <Dialog open fullWidth maxWidth="sm">
      {(isLoading || configPaths.loading || configVars.loading) && <LinearProgress />}
      <DialogTitle>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContentText sx={{ margin: 3, marginBottom: 0 }}>{steps[activeStep].title}</DialogContentText>

      {error && (
        <DialogContentText color={'red'} sx={{ marginLeft: 5, marginRight: 5 }}>
          Error: {error}
        </DialogContentText>
      )}

      <DialogContent sx={{ maxHeight: '35vh', marginBottom: 3 }}>{steps[activeStep].content}</DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <Button onClick={() => onClose()}>Cancel</Button>

          <Box sx={{ flex: '1 1 auto' }} />

          <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
          <Button onClick={handleNext}>{activeStep === steps.length - 1 ? 'Finish' : 'Next'}</Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ConfigurationDialog
