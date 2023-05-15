import { BrowserWindow } from 'electron'
import { CheckRepoActions, GitResponseError, simpleGit, SimpleGit } from 'simple-git'

import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { GitStatus } from '../../../models/GitStatus'
import { LogModel } from '../../../models/Log'
import { ensureWSLToWindowsPath } from '../../managers/PathManager'

class Git {
  private static _getGit = (repoPath: string) => {
    let enginePath = ensureWSLToWindowsPath(repoPath)

    const git: SimpleGit = simpleGit(enginePath)
    return git
  }

  static getCurrentConfigs = async (parentWindow: BrowserWindow, cluster: ClusterModel, repoPath: string) => {
    try {
      if (!repoPath) {
        return undefined
      }

      const git = Git._getGit(repoPath)

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
        message: JSON.stringify((err as GitResponseError).message)
      } as LogModel)
      return undefined
    }
  }

  static changeBranch = async (
    parentWindow: BrowserWindow,
    cluster: ClusterModel,
    repoPath: string,
    branch: string
  ) => {
    try {
      const git = Git._getGit(repoPath)

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
        message: JSON.stringify((err as GitResponseError).message)
      } as LogModel)
      return false
    }
  }

  static pullBranch = async (parentWindow: BrowserWindow, cluster: ClusterModel, repoPath: string) => {
    try {
      const git = Git._getGit(repoPath)

      await git.pull()

      return true
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'git pull branch',
        message: JSON.stringify((err as GitResponseError).message)
      } as LogModel)
      return false
    }
  }

  static pushBranch = async (parentWindow: BrowserWindow, cluster: ClusterModel, repoPath: string) => {
    try {
      const git = Git._getGit(repoPath)

      await git.push()

      return true
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'git push branch',
        message: JSON.stringify((err as GitResponseError).message)
      } as LogModel)
      return false
    }
  }
}

export default Git
