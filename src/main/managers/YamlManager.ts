import axios from 'axios'
import crypto from 'crypto'
import { app } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import PeerId from 'peer-id'

import Endpoints from '../../constants/Endpoints'
import Storage from '../../constants/Storage'
import Commands from '../Clusters/Minikube/Minikube.commands'
import { fileExists } from './PathManager'

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

// const populateRequiredValues = async (yaml: any, vars: Record<string, string>) => {
//   for (var key in yaml) {
//     if (typeof yaml[key] == 'object' && yaml[key] !== null) {
//       populateRequiredValues(yaml[key], vars)
//     } else {
//       const value: string = yaml[key].toString().trim()
//       if (
//         value.startsWith('<') &&
//         value.endsWith('>') &&
//         value.slice(1, -1).includes('<') === false &&
//         Object.keys(vars).includes(value.slice(1, -1))
//       ) {
//         yaml[key] = vars[value.slice(1, -1)]
//       } else if (value.includes('<') && value.includes('>')) {
//         // https://stackoverflow.com/a/7201413/2077741
//         const matches = value.match(/\<(.*?)\>/g)
//         let substitutedValue = yaml[key].toString()
//         matches?.forEach((matchedKey) => {
//           if (vars[matchedKey.slice(1, -1)]) {
//             substitutedValue = substitutedValue.replace(matchedKey, vars[matchedKey.slice(1, -1)])
//           }
//         })
//         yaml[key] = substitutedValue
//       }
//     }
//   }
// }

// export const ensureEngineConfigs = async (enginePath: string, vars: Record<string, string>) => {
//   const templatePath = path.join(enginePath, Endpoints.ENGINE_VALUES_TEMPLATE_PATH)
//   const yamlDoc = await getYamlDoc(templatePath, Endpoints.ENGINE_VALUES_TEMPLATE_URL)

//   await populateRequiredValues(yamlDoc, vars)

//   const yamlString = yaml.dump(yamlDoc, {
//     quotingType: '"',
//     forceQuotes: true
//   })

//   const yamlPath = path.join(appConfigsPath(), Endpoints.ENGINE_VALUES_FILE_NAME)
//   await fs.writeFile(yamlPath, yamlString)
// }

// const ensureRippledConfigs = async (enginePath: string) => {
//   const rippledCfgPath = path.join(enginePath, Endpoints.RIPPLED_FILE_PATH)
//   const rippledCfgExists = await fileExists(rippledCfgPath)
//   if (rippledCfgExists === false) {
//     await fs.copyFile(path.join(enginePath, Endpoints.RIPPLED_TEMPLATE_PATH), rippledCfgPath)
//   }

//   const validatorCfgPath = path.join(enginePath, Endpoints.VALIDATOR_FILE_PATH)
//   const validatorCfgExists = await fileExists(validatorCfgPath)
//   if (validatorCfgExists === false) {
//     await fs.copyFile(path.join(enginePath, Endpoints.VALIDATOR_TEMPLATE_PATH), validatorCfgPath)
//   }
// }

// const ensureIPFSConfigs = async (enginePath: string) => {
//   const templatePath = path.join(enginePath, Endpoints.IPFS_VALUES_TEMPLATE_PATH)
//   const yamlDoc = await getYamlDoc(templatePath, Endpoints.IPFS_VALUES_TEMPLATE_URL)

//   const vars: Record<string, string> = {}

//   const valuesKey = [] as string[]
//   findRequiredValues(yamlDoc, valuesKey)

//   const varsData = await getAllValues(Storage.VARS_TABLE)

//   for (const key of Object.keys(valuesKey)) {
//     const dbData = varsData[key]

//     // Data already exists
//     if (dbData) {
//       vars[key] = dbData.value
//     } else if (key === Storage.IPFS_CLUSTER_SECRET) {
//       const response = await exec(Commands.IPFS_SECRET)
//       const { stdout, stderr } = response

//       if (stderr) {
//         log.error('Error in ensureIPFSConfigs', stderr)
//       }

//       if (stdout) {
//         vars[key] = stdout.toString()
//         await insertOrUpdateValue(Storage.VARS_TABLE, key, stdout.toString())
//       }
//     } else if (key === Storage.IPFS_BOOTSTRAP_PEER_ID) {
//       const peerIdObj = await PeerId.create({ bits: 2048, keyType: 'Ed25519' })
//       const peerId = peerIdObj.toJSON()

//       if (peerId.privKey) {
//         vars[key] = peerId.id
//         await insertOrUpdateValue(Storage.VARS_TABLE, key, peerId.id)

//         vars[Storage.IPFS_BOOTSTRAP_PEER_PRIVATE_KEY] = peerId.privKey
//         await insertOrUpdateValue(Storage.VARS_TABLE, Storage.IPFS_BOOTSTRAP_PEER_PRIVATE_KEY, peerId.privKey)
//       }
//     }
//   }

//   await populateRequiredValues(yamlDoc, vars)

//   const yamlString = yaml.dump(yamlDoc, {
//     quotingType: '"',
//     forceQuotes: true
//   })

//   const yamlPath = path.join(appConfigsPath(), Endpoints.IPFS_VALUES_FILE_NAME)
//   await fs.writeFile(yamlPath, yamlString)
// }

// export const ensureRippleConfigs = async (enginePath: string, enableRippleStack: string) => {
//   if (enableRippleStack === 'true') {
//     await ensureRippledConfigs(enginePath)
//     await ensureIPFSConfigs(enginePath)
//   }
// }
