import childProcess, { ExecException } from 'child_process'
import { app, BrowserWindow } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

export interface IBaseHandler {
  configure: (window: BrowserWindow) => void
}

export const executeJS = async (script: string, window: BrowserWindow | null) => {
  try {
    return await window?.webContents.executeJavaScript(script)
  } catch {
    return ''
  }
}

export const delay = (delayMs: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2)
    }, delayMs)
  })
}

/**
 * https://stackoverflow.com/a/43467144/2077741
 * @param urlString
 * @returns
 */
export const isValidUrl = (urlString: string) => {
  let url

  try {
    url = new URL(urlString)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const appConfigsPath = () => {
  return path.join(app.getPath('userData'), 'configs')
}

export const assetsPath = () => {
  return path.join(__dirname, '../../../assets')
}

export const scriptsPath = () => {
  return path.join(assetsPath(), 'scripts')
}

/**
 * https://futurestud.io/tutorials/node-js-check-if-a-file-exists
 * @param path
 * @returns
 */
export const fileExists = async (path: string) => {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

export const exec = (command: string): Promise<ShellResponse> => {
  return new Promise((resolve) => {
    childProcess.exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => resolve({ error, stdout, stderr }))
  })
}

export const execStream = (
  command: string,
  onStdout: (data: any) => void,
  onStderr: (data: any) => void
): Promise<number | null> => {
  return new Promise((resolve) => {
    const process = childProcess.exec(command)
    process.stdout?.on('data', (data) => {
      onStdout(data)
    })
    process.stderr?.on('data', (data) => {
      onStderr(data)
    })
    process.on('close', (code) => {
      resolve(code)
    })
  })
}

type ShellResponse = {
  error: ExecException | Error | null | undefined
  stdout: string | Buffer | undefined
  stderr: string | Buffer | undefined
}
