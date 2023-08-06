import { exec } from '../../managers/ShellManager'

export const pull = async (repoPath: string) => {
  const command = `git -C ${repoPath} pull`
  const { stdout } = await exec(command, true)
  return stdout?.toString()
}

export const checkout = async (repoPath: string, branch: string) => {
  const command = `git -C ${repoPath} checkout ${branch}`
  const { stdout } = await exec(command, true)
  return stdout?.toString()
}

export const checkoutBranch = async (repoPath: string, localBranch: string, branch: string) => {
  const command = `git -C ${repoPath} checkout -b ${localBranch} ${branch}`
  const { stdout } = await exec(command, true)
  return stdout?.toString()
}
