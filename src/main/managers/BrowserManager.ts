import { BrowserWindow } from 'electron'

export const executeJS = async (script: string, window: BrowserWindow | null) => {
  try {
    return await window?.webContents.executeJavaScript(script)
  } catch {
    return ''
  }
}

export const executeWebViewJS = async (script: string, window: BrowserWindow | null) => {
  try {
    return await window?.webContents.executeJavaScript(`
    document.querySelector("webview").executeJavaScript("${script}")
    `)
  } catch {
    return ''
  }
}

export const executeIFrameJS = async (script: string, window: BrowserWindow | null, iframeUrl: string) => {
  try {
    return await window?.webContents.mainFrame.frames.forEach((frame) => {
      if (frame.url.includes(iframeUrl)) {
        frame.executeJavaScript(script)
      }
    })
  } catch {
    return ''
  }
}
