import { AppModel, getAppModel } from '../../../models/AppStatus'

const minikubeDependantScript = (script: string) => {
  return `
  MINIKUBE_STATUS=$(minikube status --output json);
  if [[ $MINIKUBE_STATUS == *"minikube start"* ]] || [[ $MINIKUBE_STATUS == *"Nonexistent"* ]] || [[ $MINIKUBE_STATUS == *"Stopped"* ]]; then
    echo "Minikube not configured" >&2;
    exit 1;
  else
    ${script}
    exit 0;
  fi`
}

export const MinikubeAppsStatus: AppModel[] = [
  getAppModel('node', 'Node', 'node --version;'),
  getAppModel('npm', 'npm', 'npm --version;'),
  getAppModel('python', 'Python', 'pip3 --version && python3 --version;'),
  getAppModel('make', 'Make', 'make --version;'),
  getAppModel('git', 'Git', 'git --version;'),
  getAppModel('docker', 'Docker', 'docker --version;'),
  getAppModel('dockercompose', 'Docker Compose', 'docker-compose --version;'),
  getAppModel('mysql', 'MySql', 'docker top xrengine_minikube_db;'),
  getAppModel('virtualbox', 'VirtualBox', 'vboxmanage --version;'),
  getAppModel('kubectl', 'kubectl', 'kubectl version --client --output=yaml;'),
  getAppModel('helm', 'Helm', 'helm version;'),
  getAppModel('minikube', 'Minikube', minikubeDependantScript('minikube version; minikube status;')),
  getAppModel(
    'ingress',
    'Ingress',
    minikubeDependantScript(
      "ingress_ns='ingress-nginx'; podname=$(kubectl get pods -n $ingress_ns -l app.kubernetes.io/name=ingress-nginx --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}'); kubectl exec -i -n $ingress_ns $podname -- /nginx-ingress-controller --version;"
    )
  ),
  getAppModel('redis', 'Redis', minikubeDependantScript('helm status local-redis;')),
  getAppModel('agones', 'Agones', minikubeDependantScript('helm status agones;')),
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
  getAppModel('engine', 'Ethereal Engine', minikubeDependantScript('helm status local;'))
]

export const MinikubeRippleAppsStatus: AppModel[] = [
  getAppModel('rippled', 'Rippled', minikubeDependantScript('helm status local-rippled;'), undefined, undefined, undefined, true),
  getAppModel('ipfs', 'IPFS', minikubeDependantScript('helm status local-ipfs;'), undefined, undefined, undefined, true)
]
