import { app, BrowserWindow, dialog } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import { existsSync } from 'fs'
import { ClusterType } from 'models/Cluster'
import { ConfigFileModel } from 'models/ConfigFile'
import path from 'path'

import { Channels } from '../../../constants/Channels'
import { getValue, insertOrUpdateValue } from '../../managers/StoreManager'
import { getClusters, processConfigs, processVariables } from './ConfigFile-helper'

class ConfigFile {
  static loadConfig = async (window: BrowserWindow) => {
    const category = 'load config file'
    try {
      const version = (await getValue('version')) as string
      const clusters = await getClusters()

      const config = { version, clusters } as ConfigFileModel
      return config
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      throw err
    }
  }

  static saveConfig = async (window: BrowserWindow, config: ConfigFileModel) => {
    const category = 'save config file'
    try {
      await insertOrUpdateValue('version', config.version)
      await insertOrUpdateValue('clusters', config.clusters)

      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: 'Configuration file saved.'
      })
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      throw err
    }
  }

  static exportConfig = async (window: BrowserWindow, fileName: string) => {
    try {
      const srcPath = path.join(app.getPath('userData'), 'config.json')
      const srcConfigExists = existsSync(srcPath)

      if (!srcConfigExists) {
        throw 'Currently you do not have any configuration to export.'
      }

      const destPath = path.join(app.getPath('downloads'), fileName)

      await fs.copyFile(srcPath, destPath)
      log.info('Configuration exported at: ', destPath)

      return destPath
    } catch (err) {
      log.error('Failed to export configuration.', err)
      window.webContents.send(Channels.Utilities.Log, {
        category: 'export configuration',
        message: JSON.stringify(err)
      })

      throw err
    }
  }

  static importConfig = async (window: BrowserWindow) => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Control Center Config File', extensions: ['json'] }]
      })

      if (filePaths.length === 0) {
        return false
      }

      const srcPath = filePaths[0]
      const destPath = path.join(app.getPath('userData'), 'config.json')
      await fs.copyFile(srcPath, destPath)

      log.info('Configurations imported from: ', srcPath)

      return true
    } catch (err) {
      log.error('Failed to import configurations.', err)
      window.webContents.send(Channels.Utilities.Log, {
        category: 'import configuration',
        message: JSON.stringify(err)
      })

      throw err
    }
  }

  static getDefaultConfigs = async (window: BrowserWindow) => {
    try {
      return await processConfigs()
    } catch (err) {
      log.error('Failed to get default configs.', err)
      window.webContents.send(Channels.Utilities.Log, {
        category: 'get default configs',
        message: JSON.stringify(err)
      })

      throw err
    }
  }

  static getDefaultVariables = async (window: BrowserWindow, clusterType: ClusterType, enginePath: string) => {
    try {
      return await processVariables(clusterType, enginePath)
    } catch (err) {
      log.error('Failed to get default variables.', err)
      window.webContents.send(Channels.Utilities.Log, {
        category: 'get default variables',
        message: JSON.stringify(err)
      })

      throw err
    }
  }

}

export default ConfigFile
