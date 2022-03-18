import childProcess, { ExecException } from 'child_process'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log'
import sudo from 'sudo-prompt'

import { Channels } from '../../constants/Channels'
import { AppStatus } from '../../models/AppStatus'
import { IBaseHandler } from './IBaseHandler'

const apps = [
  {
    id: 'node',
    name: 'Node',
    checkCommand: 'node --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'npm',
    name: 'npm',
    checkCommand: 'npm --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'git',
    name: 'Git',
    checkCommand: 'git --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'docker',
    name: 'Docker',
    checkCommand: 'docker --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'dockercompose',
    name: 'Docker Compose',
    checkCommand: 'docker-compose --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'mysql',
    name: 'MySql',
    checkCommand: 'docker inspect xrengine_minikube_db | grep "Running"',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'virtualbox',
    name: 'VirtualBox',
    checkCommand: 'vboxmanage --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'kubectl',
    name: 'kubectl',
    checkCommand: 'kubectl version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'helm',
    name: 'Helm',
    checkCommand: 'helm version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'minikube',
    name: 'Minikube',
    checkCommand: 'minikube version; minikube status',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'redis',
    name: 'Redis',
    checkCommand: '',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'ingress',
    name: 'Ingress',
    checkCommand: '',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'xrengine',
    name: 'XREngine',
    checkCommand: '',
    detail: '',
    status: AppStatus.Checking
  }
]

class ShellHandler implements IBaseHandler {
  configure = () => {
    ipcMain.handle(Channels.Shell.CheckMinikubeConfig, async (_event: IpcMainInvokeEvent, sudoMode: boolean) => {
      const appStatus: any = []

      for (const app of apps) {
        if (app.checkCommand) {
          const response = await exec(app.checkCommand, sudoMode)
          const { stdout, stderr } = response

          const status = {
            ...app,
            detail: stderr ? stderr : stdout,
            status: stderr ? AppStatus.NotInstalled : AppStatus.Installed
          }

          appStatus.push(status)
        } else {
          const status = {
            ...app
          }

          appStatus.push(status)
        }
      }

      return appStatus
    })
  }
}

const sudoShellExec = (command: string): Promise<ShellResponse> => {
  return new Promise((resolve) => {
    sudo.exec(
      command,
      {
        name: 'XREngine Control Center'
      },
      (error, stdout, stderr) => resolve({ error, stdout, stderr })
    )
  })
}

const shellExec = (command: string): Promise<ShellResponse> => {
  return new Promise((resolve) => {
    childProcess.exec(command, (error, stdout, stderr) => resolve({ error, stdout, stderr }))
  })
}

const exec = async (command: string, isSudo = false): Promise<ShellResponse> => {
  if (isSudo) {
    return await sudoShellExec(command)
  }

  return await shellExec(command)
}

type ShellResponse = {
  error: ExecException | Error | null | undefined
  stdout: string | Buffer | undefined
  stderr: string | Buffer | undefined
}

export default ShellHandler
