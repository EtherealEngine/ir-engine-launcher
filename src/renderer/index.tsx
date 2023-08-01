import { createRoot } from 'react-dom/client'

import App from './App'
import { ConfigFileService } from './services/ConfigFileService'
import { DeploymentService } from './services/DeploymentService'
import { LogService } from './services/LogService'
import { SettingsService } from './services/SettingsService'
import { UpdatesService } from './services/UpdatesService'
import SplashScreen from './SplashScreen'

const container = document.getElementById('root')!

const root = createRoot(container)

const searchParams = new URLSearchParams(window.location.search)
const isSplash = searchParams.get('splash')

if (isSplash) {
  UpdatesService.listen()

  root.render(<SplashScreen />)
} else {
  LogService.listen()
  DeploymentService.listen()
  SettingsService.listen()
  ConfigFileService.init()
  SettingsService.init()

  root.render(<App />)
}

// export interface IElectronAPI {
//   invoke: (channel: string, ...args: any[]) => Promise<any>
//   on: (channel: string, func: (...args: any[]) => void) => () => void
// }

// declare global {
//   interface Window {
//     electronAPI: IElectronAPI
//   }
// }
