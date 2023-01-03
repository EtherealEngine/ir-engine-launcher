import { BrowserWindow } from 'electron'
import { CheckRepoActions, simpleGit, SimpleGit } from 'simple-git'

import { Channels } from '../../../constants/Channels'
import Storage from '../../../constants/Storage'
import { ClusterModel } from '../../../models/Cluster'
import { GitStatus } from '../../../models/GitStatus'
import { LogModel } from '../../../models/Log'

class Git {
  private static _getGit = (gitPath: string) => {
    const git: SimpleGit = simpleGit(gitPath)
    return git
  }

  static getCurrentConfigs = async (parentWindow: BrowserWindow, cluster: ClusterModel) => {
    try {
      const enginePath = cluster.configs[Storage.ENGINE_PATH]
      const git = Git._getGit(enginePath)

      const isRepo = await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT)

      if (isRepo === false) {
        throw 'Not a valid git repo'
      }

      await git.fetch({ '--prune': null })

      const { all } = await git.branch()
      const { ahead, behind, current } = await git.status()

      return {
        branches: all,
        ahead,
        behind,
        current
      } as GitStatus
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'git configs',
        message: JSON.stringify(err)
      } as LogModel)
      return undefined
    }
  }

  static changeBranch = async (parentWindow: BrowserWindow, cluster: ClusterModel, branch: string) => {
    try {
      const enginePath = cluster.configs[Storage.ENGINE_PATH]
      const git = Git._getGit(enginePath)

      if (branch.startsWith('remotes/')) {
        let localBranch = branch.split('/').pop()
        if (!localBranch) {
          localBranch = branch
        }

        const { all } = await git.branchLocal()
        const localExists = all.includes(localBranch)

        if (localExists) {
          await git.checkout(localBranch)
        } else {
          await git.checkoutBranch(localBranch, branch)
        }
      } else {
        await git.checkout(branch)
      }

      return true
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'git change branch',
        message: JSON.stringify(err)
      } as LogModel)
      return false
    }
  }

  static pullBranch = async (parentWindow: BrowserWindow, cluster: ClusterModel) => {
    try {
      const enginePath = cluster.configs[Storage.ENGINE_PATH]
      const git = Git._getGit(enginePath)

      await git.pull()

      return true
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'git pull branch',
        message: JSON.stringify(err)
      } as LogModel)
      return false
    }
  }

  static pushBranch = async (parentWindow: BrowserWindow, cluster: ClusterModel) => {
    try {
      const enginePath = cluster.configs[Storage.ENGINE_PATH]
      const git = Git._getGit(enginePath)

      await git.push()

      return true
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'git push branch',
        message: JSON.stringify(err)
      } as LogModel)
      return false
    }
  }
}

export default Git
