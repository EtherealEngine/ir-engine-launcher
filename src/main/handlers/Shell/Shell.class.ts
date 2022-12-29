import { BrowserWindow } from 'electron'
import log from 'electron-log'

import { Channels } from '../../../constants/Channels'
import { exec, execStream } from '../../managers/ShellManager'
import { checkSudoPassword } from './Shell-helper'

class Shell {
  static checkSudoPassword = async (password: string = '') => {
    try {
      const validPassword = await checkSudoPassword(password)
      if (validPassword === false) {
        throw password ? 'Invalid password.' : 'Not logged in.'
      }

      return true
    } catch (err) {
      return false
    }
  }

  static executeCommand = async (command: string, window: BrowserWindow) => {
    const category = 'execute command'
    try {
      const output = await new Promise((resolve) => {
        execStream(
          command,
          (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, {
              category,
              message: stringData
            })

            resolve(stringData)
          },
          (data: any) => {
            const stringData = typeof data === 'string' ? data.trim() : data
            window.webContents.send(Channels.Utilities.Log, {
              category,
              message: stringData
            })
          }
        )
      })

      return output
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      throw err
    }
  }

  static configureIPFSDashboard = async (window: BrowserWindow) => {
    const category = 'ipfs dashboard'
    try {
      const onStdout = (data: any) => {
        const stringData = typeof data === 'string' ? data.trim() : data
        if (stringData.toString().startsWith('Handling connection')) {
          window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
        }

        if (stringData.toString().startsWith('Forwarding from 127.0.0.1')) {
          let url = stringData.toString().replace('Forwarding from ', '')
          url = url.split(' ')[0]
          url = `http://${url}/webui`
          window.webContents.send(Channels.Shell.ConfigureIPFSDashboardResponse, url)
        }
      }
      const onStderr = (data: any) => {
        const stringData = typeof data === 'string' ? data.trim() : data
        window.webContents.send(Channels.Utilities.Log, { category, message: stringData })
        window.webContents.send(Channels.Shell.ConfigureIPFSDashboardError, data)
      }
      await execStream(
        `podname=$(kubectl get pods -l app.kubernetes.io/instance=local-ipfs --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl port-forward $podname :9095;`,
        onStdout,
        onStderr
      )
    } catch (err) {
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      return err
    }
  }

  static executeRippledCommand = async (command: string, window: BrowserWindow) => {
    const category = 'rippled cli'
    try {
      const response = await exec(
        `podname=$(kubectl get pods -l app.kubernetes.io/instance=local-rippled --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl exec -i $podname -- bash -c "${command}";`
      )
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
      window.webContents.send(Channels.Utilities.Log, {
        category,
        message: JSON.stringify(err)
      })
      throw err
    }
  }
}

export default Shell
