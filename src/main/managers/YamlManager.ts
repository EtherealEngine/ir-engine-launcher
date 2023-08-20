import axios from 'axios'
import { promises as fs } from 'fs'
import yaml from 'js-yaml'
import path from 'path'

import Endpoints from '../../constants/Endpoints'
import Storage from '../../constants/Storage'
import { ClusterModel } from '../../models/Cluster'
import { appConfigsPath, ensureWSLToWindowsPath, fileExists } from './PathManager'

export const getYamlDoc = async (templatePath: string, templateUrl: string) => {
  let yamlContent = ''

  const templateFileExists = await fileExists(templatePath)
  if (templateFileExists) {
    yamlContent = await fs.readFile(templatePath, 'utf8')
  } else {
    const response = await axios.get(templateUrl)
    yamlContent = response.data
  }

  const yamlDoc = yaml.load(yamlContent)
  return yamlDoc
}

/**
 * https://stackoverflow.com/a/2549333/2077741
 * @param yaml
 * @param values
 */
export const findRequiredValues = async (yaml: any, values: string[]) => {
  for (var key in yaml) {
    if (typeof yaml[key] == 'object' && yaml[key] !== null) {
      findRequiredValues(yaml[key], values)
    } else {
      const value: string = yaml[key].toString().trim()
      if (value.startsWith('<') && value.endsWith('>') && value.slice(1, -1).includes('<') === false) {
        const variable = value.slice(1, -1)
        values.push(variable)
      } else if (value.includes('<') && value.includes('>')) {
        // https://stackoverflow.com/a/7201413/2077741
        const matches = value.match(/\<(.*?)\>/g)
        matches?.map((matchedKey) => values.push(matchedKey.slice(1, -1)))
      }
    }
  }
}

export const ensureConfigs = async (cluster: ClusterModel, templatePath: string, templateUrl: string) => {
  const valuesFileName = `${cluster.id}-${Endpoints.Paths.ENGINE_VALUES_FILE_NAME}`
  await _ensureConfigsFile(cluster, templatePath, templateUrl, valuesFileName)

  if (cluster.configs[Storage.ENABLE_RIPPLE_STACK] === 'true') {
    await _ensureRippleConfigs(cluster)
  }
}

const _ensureConfigsFile = async (
  cluster: ClusterModel,
  templatePath: string,
  templateUrl: string,
  valuesFileName: string
) => {
  const opsPath = await ensureWSLToWindowsPath(cluster.configs[Storage.OPS_PATH])
  const templateFullPath = path.join(opsPath, templatePath)
  const yamlDoc = await getYamlDoc(templateFullPath, templateUrl)

  await populateRequiredValues(yamlDoc, cluster.variables)

  const yamlString = yaml.dump(yamlDoc, {
    quotingType: '"',
    forceQuotes: true
  })

  const yamlPath = path.join(appConfigsPath(), valuesFileName)
  await fs.writeFile(yamlPath, yamlString)
}

const _ensureRippleConfigs = async (cluster: ClusterModel) => {
  await _ensureRippledConfigs(cluster)

  const valuesFileName = `${cluster.id}-${Endpoints.Paths.IPFS_VALUES_FILE_NAME}`
  await _ensureConfigsFile(
    cluster,
    Endpoints.Paths.IPFS_VALUES_TEMPLATE,
    Endpoints.Urls.IPFS_VALUES_TEMPLATE,
    valuesFileName
  )
}

const _ensureRippledConfigs = async (cluster: ClusterModel) => {
  const opsPath = await ensureWSLToWindowsPath(cluster.configs[Storage.OPS_PATH])
  const rippledCfgPath = path.join(opsPath, Endpoints.Paths.RIPPLED_FILE)
  const rippledCfgExists = await fileExists(rippledCfgPath)
  if (rippledCfgExists === false) {
    await fs.copyFile(path.join(opsPath, Endpoints.Paths.RIPPLED_TEMPLATE), rippledCfgPath)
  }

  const validatorCfgPath = path.join(opsPath, Endpoints.Paths.VALIDATOR_FILE)
  const validatorCfgExists = await fileExists(validatorCfgPath)
  if (validatorCfgExists === false) {
    await fs.copyFile(path.join(opsPath, Endpoints.Paths.VALIDATOR_TEMPLATE), validatorCfgPath)
  }
}

const populateRequiredValues = async (yaml: any, vars: Record<string, string>) => {
  for (var key in yaml) {
    if (typeof yaml[key] == 'object' && yaml[key] !== null) {
      populateRequiredValues(yaml[key], vars)
    } else {
      const value: string = yaml[key].toString().trim()
      if (
        value.startsWith('<') &&
        value.endsWith('>') &&
        value.slice(1, -1).includes('<') === false &&
        Object.keys(vars).includes(value.slice(1, -1))
      ) {
        yaml[key] = vars[value.slice(1, -1)]
      } else if (value.includes('<') && value.includes('>')) {
        // https://stackoverflow.com/a/7201413/2077741
        const matches = value.match(/\<(.*?)\>/g)
        let substitutedValue = yaml[key].toString()
        matches?.forEach((matchedKey) => {
          if (vars[matchedKey.slice(1, -1)]) {
            substitutedValue = substitutedValue.replace(matchedKey, vars[matchedKey.slice(1, -1)])
          }
        })
        yaml[key] = substitutedValue
      }
    }
  }
}
