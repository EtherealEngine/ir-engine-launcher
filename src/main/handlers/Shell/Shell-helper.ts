import log from 'electron-log'
import { scriptsPath } from '../../managers/PathManager'
import { exec } from '../../managers/ShellManager'
import path from 'path'

export const checkSudoPassword = async (password: string) => {
  const loginScript = path.join(scriptsPath(), 'sudo-login.sh')
  log.info(`Executing script ${loginScript}`)

  const response = await exec(`bash "${loginScript}" ${password}`)
  const { error } = response

  if (!error) {
    return true
  }

  log.error('Error while executing script ${loginScript}.', error)

  return false
}
