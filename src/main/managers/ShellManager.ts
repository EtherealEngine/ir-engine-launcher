import childProcess, { ExecException } from 'child_process'
import { lookup, Program } from 'ps-node'

export const execScriptFile = async (scriptFile: string, args: string[]) => {
  args = args.map((item) => (item.startsWith('-') ? item : `"${item}"`))
  return await exec(`bash "${scriptFile}" ${args.join(' ')}`)
}

export const exec = (command: string): Promise<ShellResponse> => {
  return new Promise((resolve) => {
    childProcess.exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => resolve({ error, stdout, stderr }))
  })
}

export const execStreamScriptFile = async (
  scriptFile: string,
  args: string[],
  onStdout: (data: any) => void,
  onStderr: (data: any) => void
) => {
  return await execStream(`bash "${scriptFile}" ${args.join(' ')}`, onStdout, onStderr)
}

export const execStream = (
  command: string,
  onStdout: (data: any) => void,
  onStderr: (data: any) => void
): Promise<number | null> => {
  return new Promise((resolve) => {
    const child = childProcess.exec(command)
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

type ShellResponse = {
  error: ExecException | Error | null | undefined
  stdout: string | Buffer | undefined
  stderr: string | Buffer | undefined
}
