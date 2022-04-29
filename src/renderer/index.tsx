import { render } from 'react-dom'

import App from './App'
import { DeploymentService } from './services/DeploymentService'
import { LogService } from './services/LogService'
import { SettingsService } from './services/SettingsService'
import { UpdatesService } from './services/UpdatesService'
import SplashScreen from './SplashScreen'

const searchParams = new URLSearchParams(window.location.search)
const isSplash = searchParams.get('splash')

if (isSplash) {
  UpdatesService.listen()

  render(<SplashScreen />, document.getElementById('root'))
} else {
  LogService.listen()
  SettingsService.listen()
  DeploymentService.listen()
  SettingsService.fetchSettings()
  DeploymentService.fetchDeploymentStatus()

  render(<App />, document.getElementById('root'))
}

export interface IElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  on: (channel: string, func: (...args: any[]) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
