import { render } from 'react-dom'

import App from './App'
import { DeploymentStatusService } from './services/DeploymentStatusService'
import { LogService } from './services/LogService'

LogService.listenLog()
DeploymentStatusService.listenDeploymentStatus()
DeploymentStatusService.fetchDeploymentStatus(false)

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
