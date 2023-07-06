import { BrowserWindow } from 'electron'
import { CheckRepoActions, GitResponseError, simpleGit, SimpleGit } from 'simple-git'

import Channels from '../../../constants/Channels'
import { ClusterModel } from '../../../models/Cluster'
import { GitStatus } from '../../../models/GitStatus'
import { LogModel } from '../../../models/Log'
import { ensureWSLToWindowsPath } from '../../managers/PathManager'
import { checkout, checkoutBranch, pull } from './Git-helper'

class Git {
  private static _getGit = async (repoPath: string) => {
    let enginePath = await ensureWSLToWindowsPath(repoPath)

    const git: SimpleGit = simpleGit(enginePath)
    return git
  }

  static getCurrentConfigs = async (parentWindow: BrowserWindow, cluster: ClusterModel, repoPath: string) => {
    try {
      if (!repoPath) {
        return undefined
      }

      const git = await Git._getGit(repoPath)

      const isRepo = await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT)

      if (isRepo === false) {
        throw 'Not a valid git repo'
      }

      await git.fetch({ '--prune': null })

      const branches = await git.branch()
      const tags = await git.tags({ '--sort': '-committerdate' })
      const { ahead, behind, current } = await git.status()
      const currentBranch = await git.raw('symbolic-ref', '-q', '--short', 'HEAD').catch(swallow)
      const currentTag = await git.raw('describe', '--tags', '--exact-match').catch(swallow)
      const selected = currentBranch || currentTag || current || ''

      return {
        branches: branches.all,
        tags: tags.all,
        ahead,
        behind,
        current: selected.trim()
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
      const git = await Git._getGit(repoPath)

      if (branch.startsWith('remotes/')) {
        let localBranch = branch.split('/').pop()
        if (!localBranch) {
          localBranch = branch
        }

        const { all } = await git.branchLocal()
        const localExists = all.includes(localBranch)

        if (localExists) {
          await checkout(repoPath, localBranch)
        } else {
          await checkoutBranch(repoPath, localBranch, branch)
        }
      } else {
        await checkout(repoPath, branch)
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

  static pullBranch = async (parentWindow: BrowserWindow, cluster: ClusterModel, repoPath: string) => {
    try {
      await pull(repoPath)

      return true
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, cluster.id, {
        category: 'git pull branch',
        message: JSON.stringify(err)
      } as LogModel)
      return false
    }
  }

  static pushBranch = async (parentWindow: BrowserWindow, cluster: ClusterModel, repoPath: string) => {
    try {
      const git = await Git._getGit(repoPath)

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

const swallow = () => {
  return ''
}

export default Git
