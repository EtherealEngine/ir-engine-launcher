import { render } from 'react-dom'

import App from './App'
import { DeploymentService } from './services/DeploymentService'
import { LogService } from './services/LogService'
import { accessSettingsState, SettingsService } from './services/SettingsService'

const settingsState = accessSettingsState()
const { sudoMode } = settingsState.value

LogService.listen()
SettingsService.listen()
DeploymentService.listen()
DeploymentService.fetchDeploymentStatus(sudoMode)

render(<App />, document.getElementById('root'))

export interface IElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  on: (channel: string, func: (...args: any[]) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
