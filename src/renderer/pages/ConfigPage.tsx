import Routes from 'constants/Routes'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import 'react-reflex/styles.css'
import { useLocation } from 'react-router-dom'
import OptionsPanel from 'renderer/common/OptionsPanel'
import PageRoot from 'renderer/common/PageRoot'
import LogsView from 'renderer/components/LogsView'
import StatusView from 'renderer/components/StatusView'
import WorkloadsView from 'renderer/components/Workloads/WorkloadsView'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { useDeploymentState } from 'renderer/services/DeploymentService'

import { Box } from '@mui/material'

const ConfigPage = () => {
  const location = useLocation()

  const configFileState = useConfigFileState()
  const { selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.value.find((item) => item.clusterId === selectedClusterId)

  return (
    <PageRoot>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <OptionsPanel />

        <ReflexContainer orientation="horizontal">
          <ReflexElement minSize={200} flex={0.7} style={{ overflowX: 'hidden' }}>
            {location.pathname === Routes.CONFIG && (
              <>
                <StatusView title="System" statuses={currentDeployment?.systemStatus!} />

                <StatusView title="Apps" statuses={currentDeployment?.appStatus!} />

                <StatusView title="Engine" statuses={currentDeployment?.engineStatus!} />
              </>
            )}

            {location.pathname === Routes.WORKLOADS && <WorkloadsView />}
          </ReflexElement>

          <ReflexSplitter />

          <ReflexElement minSize={50} flex={0.3} style={{ overflow: 'hidden' }}>
            <LogsView />
          </ReflexElement>
        </ReflexContainer>
      </Box>
    </PageRoot>
  )
}

export default ConfigPage
