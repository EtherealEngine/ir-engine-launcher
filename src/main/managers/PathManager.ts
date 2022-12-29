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