import crypto from 'crypto'
import { BrowserWindow } from 'electron'
import os from 'os'

import { Channels } from '../../../constants/Channels'
import ConfigEnvMap from '../../../constants/ConfigEnvMap'
import Storage from '../../../constants/Storage'
import { AppModel, AppStatus, DeploymentAppModel } from '../../../models/AppStatus'
import { ClusterModel } from '../../../models/Cluster'
import { LogModel } from '../../../models/Log'
import { SysRequirement } from '../../../models/SysRequirement'
import { getEnvFile } from '../../managers/PathManager'
import { exec } from '../../managers/ShellManager'

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
        const response = await exec(app.checkCommand)
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
        const response = await exec(engineItem.checkCommand)
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

  // #region Ensure Methods

  static ensureVariables = async (enginePath: string, vars: Record<string, string>) => {
    // Ensure auth field has value
    if (!vars[Storage.AUTH_SECRET_KEY]) {
      // https://stackoverflow.com/a/40191779/2077741
      vars[Storage.AUTH_SECRET_KEY] = crypto.randomBytes(16).toString('hex')
    }

    const envFile = await getEnvFile(enginePath)

    // Ensure aws account id & sns topic name has value
    if (!vars[Storage.AWS_ACCOUNT_ID_KEY] || !vars[Storage.SNS_TOPIC_NAME_KEY]) {
      const topicEnv = envFile.find((item) => item.trim().startsWith(`${Storage.AWS_SMS_TOPIC_KEY}=`)) || ''
      const topicEnvValue = topicEnv.trim().replace(`${Storage.AWS_SMS_TOPIC_KEY}=`, '')
      const topicEnvSplit = topicEnvValue.split(':')

      if (topicEnvSplit.length > 2) {
        vars[Storage.AWS_ACCOUNT_ID_KEY] = vars[Storage.AWS_ACCOUNT_ID_KEY]
          ? vars[Storage.AWS_ACCOUNT_ID_KEY]
          : topicEnvSplit.at(-2) || ''
        vars[Storage.SNS_TOPIC_NAME_KEY] = vars[Storage.SNS_TOPIC_NAME_KEY]
          ? vars[Storage.SNS_TOPIC_NAME_KEY]
          : topicEnvSplit.at(-1) || ''
      }
    }

    const configKeys = Object.keys(ConfigEnvMap)

    // Ensure rest of the values
    for (const key in vars) {
      if (!vars[key] && configKeys.includes(key)) {
        const envKey = (ConfigEnvMap as any)[key]
        const varEnv = envFile.find((item) => item.trim().startsWith(`${envKey}=`)) || ''

        vars[key] = varEnv.trim().replace(`${envKey}=`, '')
      }
    }
  }

  // #endregion Ensure Methods
}

export default BaseCluster
