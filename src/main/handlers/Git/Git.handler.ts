import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

// import log from 'electron-log'
import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { IBaseHandler } from '../IBaseHandler'
import Git from './Git.class'

class GitHandler implements IBaseHandler {
  configure = (window: BrowserWindow) => {
    ipcMain.handle(
      Channels.Git.GetCurrentConfigs,
      async (_event: IpcMainInvokeEvent, cluster: ClusterModel, repoPath: string) => {
        return await Git.getCurrentConfigs(window, cluster, repoPath)
      }
    )
    ipcMain.handle(
      Channels.Git.ChangeBranch,
      async (_event: IpcMainInvokeEvent, cluster: ClusterModel, repoPath: string, branch: string) => {
        return await Git.changeBranch(window, cluster, repoPath, branch)
      }
    )
    ipcMain.handle(
      Channels.Git.PullBranch,
      async (_event: IpcMainInvokeEvent, cluster: ClusterModel, repoPath: string) => {
        return await Git.pullBranch(window, cluster, repoPath)
      }
    )
    ipcMain.handle(
      Channels.Git.PushBranch,
      async (_event: IpcMainInvokeEvent, cluster: ClusterModel, repoPath: string) => {
        return await Git.pushBranch(window, cluster, repoPath)
      }
    )
  }
}

export default GitHandler
