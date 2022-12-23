import { app, BrowserWindow, dialog } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import path from 'path'

import { Channels } from '../../../constants/Channels'
import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { DefaultAppsStatus, DefaultRippleAppsStatus } from '../../../models/AppStatus'
import { getAllValues, getValue, insertOrUpdateValue } from '../../storeManager'
import { existsSync } from 'fs'
import { findRequiredValues, getEngineDefaultPath, getEnginePath, getYamlDoc } from './Settings-helper'

class Settings {
  static checkConfigs = async (window: BrowserWindow) => {
    const category = 'load setting configs'
    try {
      const configs: Record<string, string> = {}

      const configsData = await getAllValues(Storage.CONFIGS_TABLE)
      for (const key of Object.keys(configsData)) {
        configs[key] = configsData[key]
      }

      if (!configs[Storage.ENGINE_PATH]) {
        configs[Storage.ENGINE_PATH] = await getEngineDefaultPath()
      }
      if (!configs[Storage.ENABLE_RIPPLE_STACK]) {
        configs[Storage.ENABLE_RIPPLE_STACK] = 'false'
      }

      return configs
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      throw err
    }
  }
  static checkVars = async (window: BrowserWindow) => {
    const category = 'load setting vars'
    try {
      const vars: Record<string, string> = {}

      const enginePath = await getEnginePath()
      const templatePath = path.join(enginePath, Endpoints.ENGINE_VALUES_TEMPLATE_PATH)
      const yamlDoc = await getYamlDoc(templatePath, Endpoints.ENGINE_VALUES_TEMPLATE_URL)

      const valuesKey = [] as string[]
      findRequiredValues(yamlDoc, valuesKey)

      valuesKey.sort().forEach((item) => (vars[item] = ''))

      const varsData = await getAllValues(Storage.VARS_TABLE)
      for (const key of Object.keys(varsData)) {
        if (key in vars) {
          vars[key] = varsData[key]
        }
      }

      return vars
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      throw err
    }
  }

  static getCurrentAppConfigs = async () => {
    try {
      const enableRipple = await getValue(Storage.CONFIGS_TABLE, Storage.ENABLE_RIPPLE_STACK)

      if (enableRipple && enableRipple === 'true') {
        return [...DefaultAppsStatus, ...DefaultRippleAppsStatus]
      }

      return [...DefaultAppsStatus]
    } catch (err) {
      throw err
    }
  }

  static saveConfigs =
    async (configs: Record<string, string>, window: BrowserWindow) => {
      const category = 'save configs'
      try {
        for (const key in configs) {
          await insertOrUpdateValue(Storage.CONFIGS_TABLE, key, configs[key])
        }
        window.webContents.send(Channels.Utilities.Log, {
          category,
          message: 'Setting configs saved.'
        })
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category,
          message: JSON.stringify(err)
        })
        throw err
      }
    }

  static saveVars = async (vars: Record<string, string>, window: BrowserWindow) => {
    const category = 'save variables'
    try {
      for (const key in vars) {
        await insertOrUpdateValue(Storage.VARS_TABLE, key, vars[key])
      }
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: 'Setting variables saved.'
      })
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      throw err
    }
  }

  static exportSettings =
    async (fileName: string, window: BrowserWindow) => {
      try {
        const srcPath = path.join(app.getPath('userData'), 'config.json')
        const srcConfigExists = existsSync(srcPath)

        if (!srcConfigExists) {
          throw 'Currently you do not have any settings to export.'
        }

        const destPath = path.join(app.getPath('downloads'), fileName)

        await fs.copyFile(srcPath, destPath)
        log.info('Settings exported at: ', destPath)

        return destPath
      } catch (err) {
        log.error('Failed to export settings.', err)
        window.webContents.send(Channels.Utilities.Log, { category: 'export settings', message: JSON.stringify(err) })

        throw err
      }
    }

  static importSettings = async (window: BrowserWindow) => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Control Center Config File', extensions: ['json'] },
        ]
      })

      if (filePaths.length === 0) {
        return false
      }

      const srcPath = filePaths[0]
      const destPath = path.join(app.getPath('userData'), 'config.json')
      await fs.copyFile(srcPath, destPath)

      log.info('Settings imported from: ', srcPath)

      return true
    } catch (err) {
      log.error('Failed to import settings.', err)
      window.webContents.send(Channels.Utilities.Log, { category: 'import settings', message: JSON.stringify(err) })

      throw err
    }
  }

}

export default Settings
