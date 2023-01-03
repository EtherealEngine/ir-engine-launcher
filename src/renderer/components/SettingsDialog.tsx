import { ClusterModel, ClusterType } from 'models/Cluster'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { ConfigFileService, useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService } from 'renderer/services/DeploymentService'
import { useSettingsState } from 'renderer/services/SettingsService'

import { TabContext, TabPanel } from '@mui/lab'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Tab,
  Tabs,
  Typography
} from '@mui/material'

import logo from '../../../assets/icon.svg'
import ConfigBackupView from './ConfigBackupView'
import ConfigConfigsView from './ConfigConfigsView'
import ConfigMinikubeView from './ConfigMinikubeView'
import ConfigVarsView from './ConfigVarsView'

interface Props {
  onClose: () => void
}

const SettingsDialog = ({ onClose }: Props) => {
  const { enqueueSnackbar } = useSnackbar()
  const [currentTab, setTab] = useState('configs')
  const configFileState = useConfigFileState()
  const { loading, selectedCluster } = configFileState.value
  const settingsState = useSettingsState()
  const { appVersion } = settingsState.value
  const [tempConfigs, setTempConfigs] = useState({} as Record<string, string>)
  const [tempVars, setTempVars] = useState({} as Record<string, string>)

  if (!selectedCluster) {
    enqueueSnackbar('Please select a cluster.', { variant: 'error' })
    onClose()
    return <></>
  }

  const localConfigs = {} as Record<string, string>
  for (const key in selectedCluster.configs) {
    localConfigs[key] = key in tempConfigs ? tempConfigs[key] : selectedCluster.configs[key]
  }

  const localVars = {} as Record<string, string>
  for (const key in selectedCluster.variables) {
    localVars[key] = key in tempVars ? tempVars[key] : selectedCluster.variables[key]
  }

  const changeConfig = async (key: string, value: string) => {
    const newConfigs = { ...tempConfigs }
    newConfigs[key] = value
    setTempConfigs(newConfigs)
  }

  const changeVar = async (key: string, value: string) => {
    const newVars = { ...tempVars }
    newVars[key] = value
    setTempVars(newVars)
  }

  const saveSettings = async () => {
    const updatedCluster: ClusterModel = {
      ...selectedCluster,
      configs: { ...selectedCluster.configs },
      variables: { ...selectedCluster.variables }
    }

    for (const key in tempConfigs) {
      updatedCluster.configs[key] = tempConfigs[key]
    }

    for (const key in tempVars) {
      updatedCluster.variables[key] = tempVars[key]
    }

    const saved = await ConfigFileService.insertOrUpdateConfig(updatedCluster)
    if (saved) {
      onClose()
    }

    await DeploymentService.fetchDeploymentStatus(updatedCluster)
  }

  return (
    <Dialog open fullWidth maxWidth="sm" scroll="paper">
      {loading && <LinearProgress />}

      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers sx={{ padding: 0 }}>
        <TabContext value={currentTab}>
          <Box sx={{ height: '40vh', display: 'flex' }}>
            <Tabs
              orientation="vertical"
              className="settingTabs"
              value={currentTab}
              onChange={(_event, newValue) => setTab(newValue)}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              <Tab label="Configs" value="configs" />
              <Tab label="Variables" value="variables" />
              {selectedCluster.type === ClusterType.Minikube && <Tab label="Minikube" value="minikube" />}
              <Tab label="Backup" value="backup" />
              <Tab label="About" value="about" />
            </Tabs>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <TabPanel value="configs">
                <ConfigConfigsView
                  localConfigs={localConfigs}
                  onChange={changeConfig}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}
                />
              </TabPanel>
              <TabPanel value="variables">
                <ConfigVarsView
                  localVars={localVars}
                  onChange={changeVar}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}
                />
              </TabPanel>
              {selectedCluster.type === ClusterType.Minikube && (
                <TabPanel value="minikube">
                  <ConfigMinikubeView sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }} />
                </TabPanel>
              )}
              <TabPanel value="backup">
                <ConfigBackupView
                  hasPendingChanges={Object.keys(tempConfigs).length !== 0 || Object.keys(tempVars).length !== 0}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}
                />
              </TabPanel>
              <TabPanel value="about">
                <Box>
                  <Box sx={{ display: 'flex', mr: 6, mb: 2, alignItems: 'center', flexDirection: 'row' }}>
                    <Box sx={{ height: 45, mr: 0.7 }} component="img" src={logo} />
                    <Typography variant="h6">Control Center</Typography>
                  </Box>
                  <DialogContentText variant="button">App Version: {appVersion}</DialogContentText>
                </Box>
              </TabPanel>
            </Box>
          </Box>
        </TabContext>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          disabled={loading || (Object.keys(tempConfigs).length === 0 && Object.keys(tempVars).length === 0)}
          onClick={saveSettings}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog
