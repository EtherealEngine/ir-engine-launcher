export type AppSysInfo = {
  appVersion: string
  osType: OSType
}

export enum OSType {
  Windows,
  Linux,
  Mac,
  Undefined
}
