import childProcess, { ExecException } from 'child_process'
import os from 'os'
import { lookup, Program } from 'ps-node'
import TableParser from 'table-parser'

import { ensureWindowsToWSLPath } from './PathManager'

const type = os.type()

export const execScriptFile = async (scriptFile: string, args: string[]) => {
  args = args.map((item) => (item.startsWith('-') ? item : `'${item}'`))

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
  let shell = '/bin/bash'
  if (type === 'Windows_NT') {
    shell = 'powershell.exe'

    if (isLinuxCommand) {
      // Ref: https://gist.github.com/jamesmcintyre/fe9a74a603d36ffd534a1c69171994d9#file-nodecheck-sh-L13
      if (command.includes('npm ') || command.includes('node ')) {
        command = `source ~/.nvm/nvm.sh [ -x '$(command -v nvm)' ] && ${command}`
      }

      command = command.replaceAll('$', '`$')

      command = `wsl bash -ic "${command}"`
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
  let command = ''
  if (scriptFile.endsWith('.ps1')) {
    command = `. "${scriptFile}" ${args.join(' ')}`
  } else if (type === 'Windows_NT') {
    scriptFile = await ensureWindowsToWSLPath(scriptFile)
    command = `wsl bash -ic '"${scriptFile}" ${args.join(' ')}'`
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

export const getProcessList = async (command: string) => {
  if (type === 'Windows_NT') {
    return await getWSLProcessList(command)
  } else {
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

const getWSLProcessList = async (command: string) => {
  const programs: Program[] = []

  const { stdout } = await exec('ps lx', true)
  const processList = parseGrid(stdout)

  for (const process of processList) {
    if (process.command === command) {
      programs.push(process)
    }
  }

  return programs
}

/**
 * Parse the stdout into readable object.
 * @param {String} output
 * Ref: https://github.com/neekey/ps/blob/master/lib/index.js
 */

function parseGrid(output: any) {
  if (!output) {
    return []
  }
  return formatOutput(TableParser.parse(output))
}

/**
 * format the structure, extract pid, command, arguments, ppid
 * @param data
 * @return {Array}
 * Ref: https://github.com/neekey/ps/blob/master/lib/index.js
 */

function formatOutput(data: any) {
  var formattedData: Program[] = []
  data.forEach(function (d: any) {
    var pid = (d.PID && d.PID[0]) || (d.ProcessId && d.ProcessId[0]) || undefined
    var cmd = d.CMD || d.CommandLine || d.COMMAND || undefined

    if (pid && cmd) {
      var command = cmd[0]
      var args = ''

      if (cmd.length > 1) {
        args = cmd.slice(1)
      }

      formattedData.push({
        pid: pid,
        command: command,
        arguments: [args]
      })
    }
  })

  return formattedData
}

type ShellResponse = {
  error: ExecException | Error | null | undefined
  stdout: string | Buffer | undefined
  stderr: string | Buffer | undefined
}
