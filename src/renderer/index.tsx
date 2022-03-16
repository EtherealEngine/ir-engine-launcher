import { render } from 'react-dom'
import App from './App'

render(<App />, document.getElementById('root'))

export interface IElectronAPI {
    invoke: (channel: string, ...args: any[]) => Promise<void>,
    on: (channel: string, func: (...args: any[]) => {})  => Promise<void>,
}
  
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}