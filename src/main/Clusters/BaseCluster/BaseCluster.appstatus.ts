import os from 'os'

import { AppModel, getAppModel } from '../../../models/AppStatus'

let commandPrefix = ''

if (os.type() === 'Windows_NT') {
  commandPrefix = 'wsl '
}

export const DefaultSystemStatus: AppModel[] = [
  getAppModel('os', 'Operating System'),
  getAppModel('cpu', 'CPUs'),
  getAppModel('memory', 'Memory')
]

export const DefaultEngineStatus: AppModel[] = [
  getAppModel(
    'client',
    'Client',
    `${commandPrefix}kubectl get deployment local-xrengine-client -o "jsonpath={.status.availableReplicas}"`
  ),
  getAppModel(
    'apiserver',
    'API Server',
    `${commandPrefix}kubectl get deployment local-xrengine-api -o "jsonpath={.status.availableReplicas}"`
  ),
  getAppModel(
    'instanceserver',
    'Instance Server',
    `${commandPrefix}kubectl get fleets local-instanceserver -o "jsonpath={.status.readyReplicas}"`
  )
]
