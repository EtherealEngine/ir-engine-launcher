export type GitStatus = {
  branches: string[]
  tags: string[]
  ahead: number
  behind: number
  current: string | null
}
