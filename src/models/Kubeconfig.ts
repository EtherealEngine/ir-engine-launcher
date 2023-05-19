export type KubeContext = {
  cluster: string
  user: string
  name: string
  isDefault: boolean
  namespace?: string
}

export enum KubeconfigType {
  Default = 'Default',
  File = 'File',
  Text = 'Text'
}
