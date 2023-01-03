import { app, BrowserWindow } from 'electron'
import path from 'path'
import { kill } from 'ps-node'

import { Channels } from '../../constants/Channels'
import Storage from '../../constants/Storage'
import { ClusterModel } from '../../models/Cluster'
import { LogModel } from '../../models/Log'
import { scriptsPath } from './PathManager'
import { execStreamScriptFile, getProcessList } from './ShellManager'

export const startFileServer = async (window: BrowserWindow, cluster: ClusterModel) => {
  // Below block of code is to ensure file server is stopped when app is closed.
  const existingServer = await getProcessList('http-server')
  if (existingServer && existingServer.length === 0) {
    app.on('before-quit', async (e) => {
      try {
        e.preventDefault()

        const existingServers = await getProcessList('http-server')
        existingServers.forEach((httpProcess) => {
          kill(httpProcess.pid)
        })
      } catch {}

      app.quit()
      process.exit()
    })
  }

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
