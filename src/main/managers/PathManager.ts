import axios from 'axios'
import { app } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'

import Endpoints from '../../constants/Endpoints'
import { exec } from './ShellManager'

const type = os.type()

export const getEngineDefaultPath = async () => {
  let homePath = await getHomePath()

  const defaultPath = [homePath, Endpoints.DEFAULT_ENGINE_FOLDER].join('/')
  return defaultPath
}

export const getOpsDefaultPath = async () => {
  let homePath = await getHomePath()

  const defaultPath = [homePath, Endpoints.DEFAULT_OPS_FOLDER].join('/')
  return defaultPath
}

export const getHomePath = async () => {
  let homePath = app.getPath('home')

  if (type === 'Windows_NT') {
    const wslHomePathResponse = await exec(`wsl eval echo ~$USER`, false)

    if (wslHomePathResponse.error || wslHomePathResponse.stderr) {
      log.error(`Error while executing get wsl home path.`, wslHomePathResponse.error, wslHomePathResponse.stderr)
      throw 'Unable to get wsl home path'
    }

    homePath = wslHomePathResponse.stdout!.toString().trim()
  }

  return homePath
}

export const getWSLPrefixPath = async () => {
  let prefixPath = ''

  const wslPrefixPathResponse = await exec(`wsl bash -c 'echo $WSL_DISTRO_NAME'`, false)

  if (wslPrefixPathResponse.error || wslPrefixPathResponse.stderr) {
    log.error(`Error while executing get wsl prefix path.`, wslPrefixPathResponse.error, wslPrefixPathResponse.stderr)
    throw 'Unable to get wsl prefix path'
  }

  prefixPath = wslPrefixPathResponse.stdout!.toString().trim()

  return path.join(Endpoints.Paths.WSL_LOCALHOST_PREFIX, prefixPath)
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

export const filesPath = () => {
  return path.join(assetsPath(), 'files')
}

export const ensureWSLToWindowsPath = async (filePath: string) => {
  if (type === 'Windows_NT') {
    const wslPrefixPath = await getWSLPrefixPath()
    return path.join(wslPrefixPath, filePath.replaceAll('/', '\\'))
  }

  return filePath
}

export const ensureWindowsToWSLPath = async (filePath: string) => {
  if (type === 'Windows_NT') {
    filePath = filePath.replaceAll('\\', '\\\\')
    const wslPathResponse = await exec(`wsl wslpath ${filePath}`, false)

    if (wslPathResponse.error || wslPathResponse.stderr) {
      log.error(`Error while executing wslpath ${filePath}.`, wslPathResponse.error, wslPathResponse.stderr)
      throw 'Unable to convert path to wsl path'
    }

    return wslPathResponse.stdout!.toString().trim()
  }

  return filePath
}

export const getEnvFile = async (enginePath: string) => {
  let envContent = ''
  enginePath = await ensureWSLToWindowsPath(enginePath)

  // First look into .env.local
  const envPath = path.join(enginePath, Endpoints.Paths.ENGINE_ENV)
  const envFileExists = await fileExists(envPath)

  if (envFileExists) {
    envContent = await fs.readFile(envPath, 'utf8')
  } else {
    // Secondly, look into .env.local.default
    const envDefaultPath = path.join(enginePath, Endpoints.Paths.ENGINE_ENV_DEFAULT)
    const envDefaultFileExists = await fileExists(envDefaultPath)

    if (envDefaultFileExists) {
      envContent = await fs.readFile(envPath, 'utf8')
    } else {
      // Thirdly, get it from github
      const response = await axios.get(Endpoints.Urls.ENGINE_ENV_DEFAULT)
      envContent = response.data
    }
  }

  const envDoc = envContent.split('\n').filter((item) => item.startsWith('#') === false && item.includes('='))
  return envDoc
}

export const ensureConfigsFolder = async () => {
  const configsFolder = path.resolve(appConfigsPath())
  const configsFolderExists = await fileExists(configsFolder)

  if (configsFolderExists === false) {
    await fs.mkdir(configsFolder, { recursive: true })
  }

  return configsFolder
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
