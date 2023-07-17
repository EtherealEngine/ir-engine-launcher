import { app, BrowserWindow } from 'electron'
import path from 'path'

import Channels from '../../constants/Channels'
import Storage from '../../constants/Storage'
import { ClusterModel } from '../../models/Cluster'
import { LogModel } from '../../models/Log'
import { scriptsPath } from './PathManager'
import { exec, execStreamScriptFile, getProcessList } from './ShellManager'

export const startFileServer = async (window: BrowserWindow, cluster: ClusterModel, sudoPassword?: string) => {
  const existingServer = await getProcessList('http-server')
  if (existingServer.length > 0) {
    window.webContents.send(Channels.Utilities.Log, cluster.id, {
      category: 'file server',
      message: `File server already running. http-server count: ${existingServer.length}`
    } as LogModel)
    return
  }

  // Below block of code is to ensure file server is stopped when app is closed.
  app.on('before-quit', async (e) => {
    try {
      e.preventDefault()

      const existingServers = await getProcessList('http-server')
      for (const httpProcess of existingServers) {
        if (sudoPassword) {
          await exec(`echo '${sudoPassword}' | sudo -S kill -9 ${httpProcess.pid}`)
        }
      }
    } catch {}

    app.quit()
    process.exit()
  })

  const scriptsFolder = scriptsPath()
  const fileServerScript = path.join(scriptsFolder, 'configure-file-server.sh')

  const onFileServerStd = (data: any) => {
    try {
      window.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'file server',
        message: data
      } as LogModel)
    } catch {}
  }

  execStreamScriptFile(
    fileServerScript,
    [`-f "${cluster.configs[Storage.ENGINE_PATH]}"`],
    onFileServerStd,
    onFileServerStd
  )
}

export const stopFileServer = async (window: BrowserWindow, cluster: ClusterModel, sudoPassword?: string) => {
  const existingServers = await getProcessList('http-server')
  if (existingServers.length > 0) {
    for (const httpProcess of existingServers) {
      if (sudoPassword) {
        await exec(`echo '${sudoPassword}' | sudo -S kill -9 ${httpProcess.pid}`)
      }
    }
  } else {
    throw 'No file server found.'
  }
}
