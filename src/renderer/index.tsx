import { render } from 'react-dom'

import App from './App'
import { AppStatusService } from './services/AppStatusService'
import { LogService } from './services/LogService'

LogService.listenLog()
AppStatusService.listenAppStatus()
AppStatusService.fetchAppStatus(false)

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
