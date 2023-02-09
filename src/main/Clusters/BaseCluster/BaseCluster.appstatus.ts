import { AppModel, getAppModel } from '../../../models/AppStatus'

export const DefaultSystemStatus: AppModel[] = [
  getAppModel('os', 'Operating System'),
  getAppModel('cpu', 'CPUs'),
  getAppModel('memory', 'Memory')
]

export const DefaultEngineStatus: AppModel[] = [
  getAppModel(
    'client',
    'Client',
    "kubectl get deployment local-xrengine-client -o 'jsonpath={.status.availableReplicas}'"
  ),
  getAppModel(
    'apiserver',
    'API Server',
    "kubectl get deployment local-xrengine-api -o 'jsonpath={.status.availableReplicas}'"
  ),
  getAppModel(
    'instanceserver',
    'Instance Server',
    "kubectl get fleets local-instanceserver -o 'jsonpath={.status.readyReplicas}'"
  )
]
