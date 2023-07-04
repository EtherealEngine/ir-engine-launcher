import { exec } from '../../managers/ShellManager'

export const pull = async (repoPath: string) => {
  const command = `git -C ${repoPath} pull`
  const {stdout} = await exec(command, true)
  return stdout?.toString()
}
