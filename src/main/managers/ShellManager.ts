import childProcess, { ExecException } from 'child_process'
import os from 'os'
import { lookup, Program } from 'ps-node'

import { ensureWindowsToWSLPath } from './PathManager'

export const execScriptFile = async (scriptFile: string, args: string[]) => {
  const type = os.type()

  args = args.map((item) => (item.startsWith('-') ? item : `"${item}"`))

  scriptFile = await ensureWindowsToWSLPath(scriptFile)

  let command = ''
  if (scriptFile.endsWith('.ps1')) {
    command = `. '${scriptFile}' ${args.join(' ')}`
  } else {
    command = `'${scriptFile}' ${args.join(' ')}`
  }

  if (type !== 'Windows_NT') {
    command = `bash ${command}`
  }

  return await exec(command)
}

export const exec = (command: string, isLinuxCommand: boolean = true): Promise<ShellResponse> => {
  const type = os.type()

  let shell = '/bin/bash'
  if (type === 'Windows_NT') {
    shell = 'powershell.exe'

    if (isLinuxCommand) {
      // Ref: https://gist.github.com/jamesmcintyre/fe9a74a603d36ffd534a1c69171994d9#file-nodecheck-sh-L13
      if (command.includes('npm ') || command.includes('node ')) {
        command = `source ~/.nvm/nvm.sh [ -x '$(command -v nvm)' ] && ${command}`
      }

      command = `wsl bash -c "${command}"`
    }
  }

  return new Promise((resolve) => {
    childProcess.exec(command, { shell }, (error, stdout, stderr) => resolve({ error, stdout, stderr }))
  })
}

export const execStreamScriptFile = async (
  scriptFile: string,
  args: string[],
  onStdout: (data: any) => void,
  onStderr: (data: any) => void
) => {
  const type = os.type()

  let command = ''
  if (scriptFile.endsWith('.ps1')) {
    command = `. "${scriptFile}" ${args.join(' ')}`
  } else if (type === 'Windows_NT') {
    scriptFile = await ensureWindowsToWSLPath(scriptFile)
    command = `wsl bash "${scriptFile}" ${args.join(' ')}`
  } else {
    command = `bash "${scriptFile}" ${args.join(' ')}`
  }

  return await execStream(command, onStdout, onStderr)
}

export const execStream = (
  command: string,
  onStdout: (data: any) => void,
  onStderr: (data: any) => void
): Promise<number | null> => {
  const type = os.type()

  let shell: undefined | string = undefined
  if (type === 'Windows_NT') {
    shell = 'powershell.exe'
  }

  return new Promise((resolve) => {
    const child = childProcess.exec(command, { shell })
    child.stdout?.on('data', (data) => {
      onStdout(data)
    })
    child.stderr?.on('data', (data) => {
      onStderr(data)
    })
    child.on('close', (code) => {
      resolve(code)
    })
  })
}

export const getProcessList = (command: string) => {
  return new Promise<Program[]>((resolve, reject) => {
    lookup(
      {
        command
      },
      (err, resultList) => {
        if (err) {
          reject(err)
        } else {
          resolve(resultList)
        }
      }
    )
  })
}

export const cleanseString = (inputString: string) => {
  let finalString = ''

  for (const char of inputString) {
    if (char.charCodeAt(0) !== 0) {
      finalString += char
    }
  }

  return finalString
}

type ShellResponse = {
  error: ExecException | Error | null | undefined
  stdout: string | Buffer | undefined
  stderr: string | Buffer | undefined
}
