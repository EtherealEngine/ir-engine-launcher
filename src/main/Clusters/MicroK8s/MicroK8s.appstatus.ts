import { AppModel, getAppModel } from '../../../models/AppStatus'

const microk8sDependantScript = (script: string) => {
  return `
  if microk8s status | grep -q 'microk8s is not running'; then
    echo "MicroK8s not configured" >&2;
    exit 1;
  else
    ${script}
    exit 0;
  fi`
}

export const MicroK8sAppsStatus: AppModel[] = [
  getAppModel('node', 'Node', 'node --version;'),
  getAppModel('npm', 'npm', 'npm --version;'),
  getAppModel('python', 'Python', 'pip3 --version && python3 --version;'),
  getAppModel('make', 'Make', 'make --version;'),
  getAppModel('git', 'Git', 'git --version;'),
  getAppModel('docker', 'Docker', 'docker --version;'),
  getAppModel('dockercompose', 'Docker Compose', 'docker-compose --version;'),
  getAppModel('mysql', 'MySql', 'docker top xrengine_minikube_db;'),
  getAppModel('kubectl', 'kubectl', 'kubectl version --client --output=yaml;'),
  getAppModel('helm', 'Helm', 'helm version;'),
  getAppModel('microk8s', 'MicroK8s', microk8sDependantScript('microk8s version; microk8s status;')),
  getAppModel(
    'ingress',
    'Ingress',
    microk8sDependantScript(
      "ingress_ns='ingress'; podname=$(kubectl get pods -n $ingress_ns -l name=nginx-ingress-microk8s --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl exec -i -n $ingress_ns $podname -- /nginx-ingress-controller --version;"
    )
  ),
  getAppModel('redis', 'Redis', microk8sDependantScript('helm status local-redis;')),
  getAppModel('agones', 'Agones', microk8sDependantScript('helm status agones;')),
  getAppModel(
    'fileserver',
    'Local File Server',
    `
  if lsof -Pi :8642 -sTCP:LISTEN -t >/dev/null ; then
    echo "File server configured:"
    lsof -Pi :8642 -sTCP:LISTEN
    exit 0;
  else
    echo "File server not configured" >&2;
    exit 1;
  fi
  `
  ),
  getAppModel('engine', 'Ethereal Engine', microk8sDependantScript('helm status local;'))
]

export const MicroK8sRippleAppsStatus: AppModel[] = [
  getAppModel('rippled', 'Rippled', microk8sDependantScript('helm status local-rippled;'), undefined, undefined, true),
  getAppModel('ipfs', 'IPFS', microk8sDependantScript('helm status local-ipfs;'), undefined, undefined, true)
]
