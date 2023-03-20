import { BrowserWindow } from 'electron'
import log from 'electron-log'
import os from 'os'
import path from 'path'

import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { LogModel } from '../../../models/Log'
import { scriptsPath } from '../../managers/PathManager'
import { cleanseString, exec, execScriptFile, execStream } from '../../managers/ShellManager'

class Shell {
  static checkSudoPassword = async (password: string = '') => {
    try {
      const loginScript = path.join(scriptsPath(), 'check-login.sh')

      const type = os.type()
      if (type === 'Windows_NT') {
        await Shell._checkSudoPasswordWindows(password, loginScript)
      } else {
        await Shell._checkSudoPasswordLinux(password, loginScript)
      }

      return true
    } catch (err) {
      return false
    }
  }

  private static _checkSudoPasswordLinux = async (password: string = '', loginScript: string) => {
    let validPassword = false

    log.info(`Executing script ${loginScript}`)

    const response = await execScriptFile(loginScript, [password])
    const { error } = response

    if (error) {
      log.error(`Error while executing script ${loginScript}.`, error)
    } else {
      validPassword = true
    }

    if (validPassword === false) {
      throw password ? 'Invalid password.' : 'Not logged in.'
    }
  }

  private static _checkSudoPasswordWindows = async (password: string = '', loginScript: string) => {
    let validPassword = false

    // First make sure WSL is installed.
    const wslResponse = await exec('wsl --status', false)
    const wslResponseOutput = cleanseString(wslResponse.stdout?.toString() || '')
    log.info(`WSL status ${wslResponseOutput}`)

    if (wslResponse.error || wslResponse.stderr) {
      log.error(`Error while executing wsl status ${loginScript}.`, wslResponse.error, wslResponse.stderr)
      throw 'Unable to get wsl status'
    }

    if (wslResponseOutput.includes(': Ubuntu')) {
      log.info(`Executing script ${loginScript}`)

      const response = await execScriptFile(loginScript, [password])
      if (response.error) {
        log.error(`Error while executing script ${loginScript}.`, response.error, response.stderr)
      } else {
        validPassword = true
      }

      if (validPassword === false) {
        throw password ? 'Invalid password.' : 'Not logged in.'
      }
    } else {
      log.error(`Please make sure Ubuntu is your default WSL distribution. ${wslResponseOutput}`)
      throw 'Please make sure Ubuntu is your default WSL distribution.'
    }
  }

  static executeCommand = async (window: BrowserWindow, cluster: ClusterModel, command: string) => {
    const category = 'execute command'
    try {
      const output = await new Promise((resolve) => {
        execStream(
          command,
          (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, cluster.id, {
              category,
              message: stringData
            } as LogModel)

            resolve(stringData)
          },
          (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, cluster.id, {
              category,
              message: stringData
            } as LogModel)
          }
        )
      })

      return output
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category,
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  static configureIPFSDashboard = async (window: BrowserWindow, cluster: ClusterModel) => {
    const category = 'ipfs dashboard'
    try {
      const onStdout = (data: any) => {
        const stringData = typeof data === 'string' ? data.trim() : data
        if (stringData.toString().startsWith('Handling connection')) {
          window.webContents.send(Channels.Utilities.Log, cluster.id, { category, message: stringData })
        }

        if (stringData.toString().startsWith('Forwarding from 127.0.0.1')) {
          let url = stringData.toString().replace('Forwarding from ', '')
          url = url.split(' ')[0]
          url = `http://${url}/webui`
          window.webContents.send(Channels.Shell.ConfigureIPFSDashboardResponse, cluster.id, url)
        }
      }
      const onStderr = (data: any) => {
        const stringData = typeof data === 'string' ? data.trim() : data
        window.webContents.send(Channels.Utilities.Log, cluster.id, { category, message: stringData } as LogModel)
        window.webContents.send(Channels.Shell.ConfigureIPFSDashboardError, cluster.id, data)
      }
      await execStream(
        `podname=$(kubectl get pods -l app.kubernetes.io/instance=local-ipfs --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl port-forward $podname :9095;`,
        onStdout,
        onStderr
      )
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category,
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }

  static executeRippledCommand = async (window: BrowserWindow, cluster: ClusterModel, command: string) => {
    const category = 'rippled cli'
    try {
      command = `podname=$(kubectl get pods -l app.kubernetes.io/instance=local-rippled --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl exec -i $podname -- bash -c '${command}';`
      const response = await exec(command)
      const { stdout, stderr } = response

      let output = ''
      if (stderr) {
        log.error('Error in ExecuteRippledCommand', stderr)
        output = stderr.toString()
      }

      if (stdout) {
        output += stdout.toString()
      }

      return output
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category,
        message: JSON.stringify(err)
      } as LogModel)
      throw err
    }
  }
}

export default Shell
