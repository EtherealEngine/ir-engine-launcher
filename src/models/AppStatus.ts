export type AppModel = {
  id: string
  name: string
  checkCommand: string
  detail: string | Buffer | undefined
  status: AppStatus
}

export enum AppStatus {
  Checking,
  Configured,
  NotConfigured,
  Pending
}

export const DefaultApps: AppModel[] = [
  {
    id: 'node',
    name: 'Node',
    checkCommand: 'node --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'npm',
    name: 'npm',
    checkCommand: 'npm --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'python',
    name: 'Python',
    checkCommand: 'pip --version && python3 --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'make',
    name: 'Make',
    checkCommand: 'make --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'git',
    name: 'Git',
    checkCommand: 'git --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'docker',
    name: 'Docker',
    checkCommand: 'docker --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'dockercompose',
    name: 'Docker Compose',
    checkCommand: 'docker-compose --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'mysql',
    name: 'MySql',
    checkCommand: 'docker inspect xrengine_minikube_db | grep "Running"',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'virtualbox',
    name: 'VirtualBox',
    checkCommand: 'vboxmanage --version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'kubectl',
    name: 'kubectl',
    checkCommand: 'kubectl version --client',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'helm',
    name: 'Helm',
    checkCommand: 'helm version',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'minikube',
    name: 'Minikube',
    checkCommand: 'minikube version; minikube status',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'ingress',
    name: 'Ingress',
    checkCommand: `ingress_ns="ingress-nginx";
    podname=$(kubectl get pods -n $ingress_ns -l app.kubernetes.io/name=ingress-nginx --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}');
    kubectl exec -i -n $ingress_ns $podname -- /nginx-ingress-controller --version`,
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'redis',
    name: 'Redis',
    checkCommand: 'helm status local-redis',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'agones',
    name: 'Agones',
    checkCommand: 'helm status agones',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'xrengine',
    name: 'XREngine',
    checkCommand: 'helm status local',
    detail: '',
    status: AppStatus.Checking
  }
]

export const DefaultDeployments: AppModel[] = [
  {
    id: 'client',
    name: 'Client',
    checkCommand: 'kubectl get deployment local-xrengine-client -o "jsonpath={.status.availableReplicas}"',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'api',
    name: 'API Server',
    checkCommand: 'kubectl get deployment local-xrengine-api -o "jsonpath={.status.availableReplicas}"',
    detail: '',
    status: AppStatus.Checking
  },
  {
    id: 'gameserver',
    name: 'Gameservers',
    checkCommand: 'kubectl get fleets local-gameserver -o "jsonpath={.status.availableReplicas}"',
    detail: '',
    status: AppStatus.Checking
  },
]