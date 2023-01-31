import crypto from 'crypto'
import { BrowserWindow } from 'electron'
import log from 'electron-log'
import os from 'os'
import path from 'path'
import PeerId from 'peer-id'

import { Channels } from '../../../constants/Channels'
import ConfigEnvMap from '../../../constants/ConfigEnvMap'
import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { AppModel, AppStatus, DeploymentAppModel } from '../../../models/AppStatus'
import { ClusterModel } from '../../../models/Cluster'
import { LogModel } from '../../../models/Log'
import { SysRequirement } from '../../../models/SysRequirement'
import { processVariablesFile } from '../../handlers/ConfigFile/ConfigFile-helper'
import Utilities from '../../handlers/Utilities/Utilities.class'
import { getEnvFile } from '../../managers/PathManager'
import { exec } from '../../managers/ShellManager'
import Commands from './BaseCluster.commands'

class BaseCluster {
  // #region Status Check Methods

  static checkClusterStatus = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    deploymentApps: DeploymentAppModel,
    sysRequirements: SysRequirement[]
  ) => {
    await BaseCluster._checkSystemStatus(window, cluster, deploymentApps.systemStatus, sysRequirements)

    const preRequisitesConfigured = await BaseCluster._checkAppStatus(window, cluster, deploymentApps.appStatus)

    await BaseCluster._checkEngineStatus(window, cluster, deploymentApps.engineStatus, preRequisitesConfigured)
  }

  private static _checkSystemStatus = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    systemApps: AppModel[],
    sysRequirements: SysRequirement[]
  ) => {
    for (const app of systemApps) {
      let status: AppModel = {
        ...app
      }

      const type = os.type()
      const currentOSReqs = sysRequirements.find((item) => item.os === type)

      if (status.id === 'os') {
        status = {
          ...app,
          detail: type,
          status: currentOSReqs ? AppStatus.Configured : AppStatus.NotConfigured
        }
      } else if (status.id === 'cpu') {
        const cpus = os.cpus()
        status = {
          ...app,
          detail: `${cpus.length.toString()} core(s)`,
          status: currentOSReqs
            ? cpus.length < currentOSReqs.minCPU
              ? AppStatus.NotConfigured
              : AppStatus.Configured
            : AppStatus.Pending
        }
      } else if (status.id === 'memory') {
        let memory = os.totalmem() / (1024 * 1024)
        status = {
          ...app,
          detail: `${memory.toString()} MB`,
          status: currentOSReqs
            ? memory < currentOSReqs.minMemory
              ? AppStatus.NotConfigured
              : AppStatus.Configured
            : AppStatus.Pending
        }
      } else {
        status = await Utilities.checkPrerequisite(app)
      }

      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: status.name,
        message: status.detail
      } as LogModel)
      window.webContents.send(Channels.Cluster.CheckSystemStatusResult, cluster.id, status)
    }
  }

  private static _checkAppStatus = async (window: BrowserWindow, cluster: ClusterModel, apps: AppModel[]) => {
    let mandatoryConfigured = true
    for (const app of apps) {
      let status: AppModel = {
        ...app
      }

      if (app.checkCommand) {
        const response = await exec(app.checkCommand, app.isLinuxCommand)
        const { stdout, stderr } = response

        if (stdout) {
          window.webContents.send(Channels.Utilities.Log, cluster.id, {
            category: status.name,
            message: typeof stdout === 'string' ? stdout.trim() : stdout
          } as LogModel)
        }
        if (stderr) {
          window.webContents.send(Channels.Utilities.Log, cluster.id, {
            category: status.name,
            message: typeof stderr === 'string' ? stderr.trim() : stderr
          } as LogModel)

          if (!app.isOptional) {
            mandatoryConfigured = false
          }
        }

        status = {
          ...app,
          detail: stderr ? stderr : stdout,
          status: stderr ? AppStatus.NotConfigured : AppStatus.Configured
        }
      }

      window.webContents.send(Channels.Cluster.CheckAppStatusResult, cluster.id, status)
    }

    return mandatoryConfigured
  }

  private static _checkEngineStatus = async (
    window: BrowserWindow,
    cluster: ClusterModel,
    engineApps: AppModel[],
    preRequisitesConfigured: boolean
  ) => {
    for (const engineItem of engineApps) {
      let status: AppModel = {
        ...engineItem
      }

      if (preRequisitesConfigured == false) {
        status = {
          ...engineItem,
          detail: 'Ethereal Engine required apps not configured',
          status: AppStatus.NotConfigured
        }
      } else if (engineItem.checkCommand) {
        const response = await exec(engineItem.checkCommand, engineItem.isLinuxCommand)
        const { stdout, stderr } = response

        if (stdout) {
          window.webContents.send(Channels.Utilities.Log, cluster.id, {
            category: engineItem.name,
            message: typeof stdout === 'string' ? stdout.trim() : stdout
          } as LogModel)
        }
        if (stderr) {
          window.webContents.send(Channels.Utilities.Log, cluster.id, {
            category: engineItem.name,
            message: typeof stderr === 'string' ? stderr.trim() : stderr
          } as LogModel)
        }

        let detail: string | Buffer = `Ready Instances: ${stdout === '' || stdout === undefined ? 0 : stdout}`
        let itemStatus = AppStatus.Configured

        if (stderr) {
          detail = stderr
          itemStatus = AppStatus.NotConfigured
        } else if (!stdout || parseInt(stdout.toString()) < 1) {
          itemStatus = AppStatus.NotConfigured
        }

        status = {
          ...engineItem,
          detail,
          status: itemStatus
        }
      }

      window.webContents.send(Channels.Cluster.CheckEngineStatusResult, cluster.id, status)
    }
  }

  // #endregion Status Check Methods

  // #region Ensure Variables Method

  static ensureVariables = async (
    cluster: ClusterModel,
    onOverrideVariables?: (variables: Record<string, string>) => void
  ) => {
    await BaseCluster._ensureEngineVariables(cluster)

    if (cluster.configs[Storage.ENABLE_RIPPLE_STACK] === 'true') {
      await BaseCluster._ensureIPFSVariables(cluster)
    }

    if (onOverrideVariables) {
      onOverrideVariables(cluster.variables)
    }
  }

  private static _ensureEngineVariables = async (cluster: ClusterModel) => {
    const enginePath = cluster.configs[Storage.ENGINE_PATH]

    // Ensure hostUploadFolder values
    cluster.variables['FILE_SERVER_FOLDER'] = path.join(enginePath, Endpoints.Paths.FILE_SERVER)

    // Ensure auth secret field has value
    if (!cluster.variables[Storage.AUTH_SECRET_KEY]) {
      // https://stackoverflow.com/a/40191779/2077741
      cluster.variables[Storage.AUTH_SECRET_KEY] = crypto.randomBytes(16).toString('hex')
    }

    // Ensure auth field has value
    if (!cluster.variables[Storage.AUTH_SECRET_KEY]) {
      // https://stackoverflow.com/a/40191779/2077741
      cluster.variables[Storage.AUTH_SECRET_KEY] = crypto.randomBytes(16).toString('hex')
    }

    const envFile = await getEnvFile(enginePath)

    // Ensure aws account id & sns topic name has value
    if (!cluster.variables[Storage.AWS_ACCOUNT_ID_KEY] || !cluster.variables[Storage.SNS_TOPIC_NAME_KEY]) {
      const topicEnv = envFile.find((item) => item.trim().startsWith(`${Storage.AWS_SMS_TOPIC_KEY}=`)) || ''
      const topicEnvValue = topicEnv.trim().replace(`${Storage.AWS_SMS_TOPIC_KEY}=`, '')
      const topicEnvSplit = topicEnvValue.split(':')

      if (topicEnvSplit.length > 2) {
        cluster.variables[Storage.AWS_ACCOUNT_ID_KEY] = cluster.variables[Storage.AWS_ACCOUNT_ID_KEY]
          ? cluster.variables[Storage.AWS_ACCOUNT_ID_KEY]
          : topicEnvSplit.at(-2) || ''
        cluster.variables[Storage.SNS_TOPIC_NAME_KEY] = cluster.variables[Storage.SNS_TOPIC_NAME_KEY]
          ? cluster.variables[Storage.SNS_TOPIC_NAME_KEY]
          : topicEnvSplit.at(-1) || ''
      }
    }

    const configKeys = Object.keys(ConfigEnvMap)

    // Ensure rest of the values
    for (const key in cluster.variables) {
      if (!cluster.variables[key] && configKeys.includes(key)) {
        const envKey = (ConfigEnvMap as any)[key]
        const varEnv = envFile.find((item) => item.trim().startsWith(`${envKey}=`)) || ''

        cluster.variables[key] = varEnv.trim().replace(`${envKey}=`, '')
      }
    }
  }

  private static _ensureIPFSVariables = async (cluster: ClusterModel) => {
    const vars: Record<string, string> = {}

    const varsData = await processVariablesFile(
      cluster.configs,
      cluster.variables,
      Endpoints.Paths.IPFS_VALUES_TEMPLATE,
      Endpoints.Urls.IPFS_VALUES_TEMPLATE
    )

    for (const key of Object.keys(varsData)) {
      const existingValue = varsData[key]

      // Data already exists
      if (existingValue) {
        vars[key] = existingValue
      } else if (key === Storage.IPFS_CLUSTER_SECRET) {
        const response = await exec(Commands.IPFS_SECRET)
        const { stdout, stderr } = response

        if (stderr) {
          log.error('Error in _ensureIPFSVariables', stderr)
        }

        if (stdout) {
          vars[key] = stdout.toString()
        }
      } else if (key === Storage.IPFS_BOOTSTRAP_PEER_ID) {
        const peerIdObj = await PeerId.create({ bits: 2048, keyType: 'Ed25519' })
        const peerId = peerIdObj.toJSON()

        if (peerId.privKey) {
          vars[key] = peerId.id
          vars[Storage.IPFS_BOOTSTRAP_PEER_PRIVATE_KEY] = peerId.privKey
        }
      }
    }
  }

  // #endregion Ensure Variables Method
}

export default BaseCluster
