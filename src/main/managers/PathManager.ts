import axios from 'axios'
import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

import Endpoints from '../../constants/Endpoints'

export const getEngineDefaultPath = () => {
  const defaultPath = path.join(app.getPath('home'), Endpoints.DEFAULT_ENGINE_FOLDER)
  return defaultPath
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

export const getEnvFile = async (enginePath: string) => {
  let envContent = ''

  // First look into .env.local
  const envPath = path.join(enginePath, Endpoints.ENGINE_ENV_PATH)
  const envFileExists = await fileExists(envPath)

  if (envFileExists) {
    envContent = await fs.readFile(envPath, 'utf8')
  } else {
    // Secondly, look into .env.local.default
    const envDefaultPath = path.join(enginePath, Endpoints.ENGINE_ENV_DEFAULT_PATH)
    const envDefaultFileExists = await fileExists(envDefaultPath)

    if (envDefaultFileExists) {
      envContent = await fs.readFile(envPath, 'utf8')
    } else {
      // Thirdly, get it from github
      const response = await axios.get(Endpoints.ENGINE_ENV_DEFAULT_URL)
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
