export type GitStatus = {
  branches: string[]
  ahead: number
  behind: number
  current: string | null
}
