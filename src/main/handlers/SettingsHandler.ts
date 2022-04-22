import axios from 'axios'
import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { promises as fs } from 'fs'
import yaml from 'js-yaml'
import path from 'path'

// import log from 'electron-log'
import { Channels } from '../../constants/Channels'
import Endpoints from '../../constants/Endpoints'
import Storage from '../../constants/Storage'
import { getAllValues, getValue, insertOrUpdateValue } from '../dbManager'
import { fileExists, IBaseHandler } from './IBaseHandler'

class SettingsHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(Channels.Settings.CheckPaths, async (_event: IpcMainInvokeEvent) => {
      const category = 'load setting paths'
      try {
        const paths: Record<string, string> = {}

        const pathsData = await getAllValues(Storage.PATHS_TABLE)
        for (const data of pathsData) {
          paths[data.id] = data.value
        }

        if (!paths[Storage.XRENGINE_PATH]) {
          paths[Storage.XRENGINE_PATH] = await getXREngineDefaultPath()
        }

        return paths
      } catch (err) {
        window.webContents.send(Channels.Utilities.Log, {
          category,
          message: JSON.stringify(err)
        })
        throw err
      }
    }),
      ipcMain.handle(Channels.Settings.CheckVars, async (_event: IpcMainInvokeEvent) => {
        const category = 'load setting vars'
        try {
          const vars: Record<string, string> = {}

          const xrPath = await getXREnginePath()
          const templatePath = path.join(xrPath, Endpoints.VALUES_TEMPLATE_PATH)
          const templateFileExists = await fileExists(templatePath)
          let yamlContent = ''

          if (templateFileExists) {
            yamlContent = await fs.readFile(templatePath, 'utf8')
          } else {
            const response = await axios.get(Endpoints.VALUES_TEMPLATE_URL)
            yamlContent = response.data
          }

          const yamlDoc = yaml.load(yamlContent)
          const valuesKey = [] as string[]
          findRequiredValues(yamlDoc, valuesKey)

          valuesKey.sort().forEach(item => vars[item] = '')

          const varsData = await getAllValues(Storage.VARS_TABLE)
          for (const data of varsData) {
            vars[data.id] = data.value
          }

          return vars
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          throw err
        }
      }),
      ipcMain.handle(Channels.Settings.SavePaths, async (_event: IpcMainInvokeEvent, paths: Record<string, string>) => {
        const category = 'save paths'
        try {
          for (const key in paths) {
            await insertOrUpdateValue(Storage.PATHS_TABLE, key, paths[key])
          }
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: 'Setting paths saved.'
          })
        } catch (err) {
          window.webContents.send(Channels.Utilities.Log, {
            category,
            message: JSON.stringify(err)
          })
          throw err
        }
      }),
      ipcMain.handle(Channels.Settings.SaveVars, async (_event: IpcMainInvokeEvent, vars: Record<string, string>) => {
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
      })
  }
}

/**
 * https://stackoverflow.com/a/2549333/2077741
 * @param yaml 
 * @param values 
 */
const findRequiredValues = async (yaml: any, values: string[]) => {
  for (var key in yaml) {
    if (typeof yaml[key] == 'object' && yaml[key] !== null) {
      findRequiredValues(yaml[key], values)
    } else {
      const value: string = yaml[key].toString().trim()
      if (value.startsWith('<') && value.endsWith('>')) {
        const variable = value.slice(1, -1);
        values.push(variable)
      }
    }
  }
}

export const getXREngineDefaultPath = () => {
  const defaultPath = path.join(app.getPath('home'), Endpoints.DEFAULT_XRENGINE_FOLDER)
  return defaultPath
}

export const getXREnginePath = async () => {
  const xrenginePath = await getValue(Storage.PATHS_TABLE, Storage.XRENGINE_PATH)
  return xrenginePath ? xrenginePath.value : getXREngineDefaultPath()
}

export default SettingsHandler
