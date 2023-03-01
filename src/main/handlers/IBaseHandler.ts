import { BrowserWindow } from 'electron'

export interface IBaseHandler {
  configure: (window: BrowserWindow) => void
}
