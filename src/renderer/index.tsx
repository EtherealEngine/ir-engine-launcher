import { render } from 'react-dom'

import App from './App'
import { DeploymentService } from './services/DeploymentService'
import { LogService } from './services/LogService'
import { SettingsService } from './services/SettingsService'

LogService.listen()
SettingsService.listen()
DeploymentService.listen()
SettingsService.fetchPaths()
DeploymentService.fetchDeploymentStatus()

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
