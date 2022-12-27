import { ClusterType } from 'models/Cluster'
import { ConfigFileService, useConfigFileState } from 'renderer/services/ConfigFileService'

import AddIcon from '@mui/icons-material/Add'
import { Box, IconButton, Tab, Tabs, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import logoEngine from '../../../assets/icon.svg'
import logoMicrok8s from '../../../assets/icons/microk8s.png'
import logoMinikube from '../../../assets/icons/minikube.png'

const HotBar = () => {
  const theme = useTheme()
  const configFileState = useConfigFileState()
  const { clusters, selectedClusterId } = configFileState.value

  return (
    <Box sx={{ backgroundColor: theme.palette.primary.main }}>
      <Box
        sx={{
          backgroundColor: 'var(--dock)',
          width: '100px',
          height: 'calc(100vh - 70px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Tabs
          className="blankTabs"
          orientation="vertical"
          variant="scrollable"
          value={0}
          sx={{ flex: 1, width: '100%' }}
        >
          {clusters.map((cluster) => (
            <Tab
              key={cluster.id}
              title={`${cluster.name} (${
                cluster.type === ClusterType.Minikube
                  ? 'Minikube'
                  : cluster.type === ClusterType.MicroK8s
                  ? 'MicroK8s'
                  : 'Undefined'
              })`}
              label={
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: selectedClusterId === cluster.id ? 'var(--purpleDarkest)' : undefined,
                    color: 'var(--text)',
                    flexDirection: 'column',
                    display: 'flex',
                    padding: 1,
                    alignItems: 'center',
                    borderRadius: 1,
                    gap: 1
                  }}
                >
                  <Box
                    sx={{ width: 45, mt: 0.5 }}
                    component="img"
                    src={
                      cluster.type === ClusterType.Minikube
                        ? logoMinikube
                        : cluster.type === ClusterType.MicroK8s
                        ? logoMicrok8s
                        : logoEngine
                    }
                  />
                  <Typography variant="body2">{cluster.name}</Typography>
                </Box>
              }
              onClick={() => ConfigFileService.setSelectedClusterId(cluster.id)}
            />
          ))}
        </Tabs>

        <IconButton sx={{ mb: 2, mt: 2, border: '3px solid white' }}>
          <AddIcon sx={{ fontSize: '30px' }} />
        </IconButton>
      </Box>
    </Box>
  )
}

export default HotBar
