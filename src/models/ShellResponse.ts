// import { Buffer } from 'buffer'

export type ShellResponse = {
  error: ExecException | Error | null | undefined
  stdout: string | Buffer | undefined
  stderr: string | Buffer | undefined
}

interface ExecException extends Error {
  cmd?: string | undefined
  killed?: boolean | undefined
  code?: number | undefined
  signal?: NodeJS.Signals | undefined
}
