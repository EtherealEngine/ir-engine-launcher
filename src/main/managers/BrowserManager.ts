import { BrowserWindow } from 'electron'

export const executeJS = async (script: string, window: BrowserWindow | null) => {
  try {
    return await window?.webContents.executeJavaScript(script)
  } catch {
    return ''
  }
}