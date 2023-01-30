import os from 'os'

import { AppModel, getAppModel } from '../../../models/AppStatus'

let commandPrefix = ''
let scriptPrefix = ''
let scriptPostfix = ''
let microk8sPrefix = ''
let nvmProfilePrefix = ''
let nvmProfilePostfix = ''

if (os.type() === 'Windows_NT') {
  commandPrefix = 'wsl '
  scriptPrefix = 'wsl bash -c "'
  scriptPostfix = '"'
  microk8sPrefix = '/snap/bin/'
  nvmProfilePrefix = `bash -c 'source ~/.nvm/nvm.sh [ -x "$(command -v nvm)" ] && ` // Ref: https://gist.github.com/jamesmcintyre/fe9a74a603d36ffd534a1c69171994d9#file-nodecheck-sh-L13
  nvmProfilePostfix = `'`
}

const microk8sDependantScript = (script: string) => {
  // Escape special characters.
  script = script.replaceAll('$', '`$')

  return `${scriptPrefix}
  if ${microk8sPrefix}microk8s status | grep -q 'microk8s is not running'; then
    echo 'MicroK8s not configured' >&2;
    exit 1;
  else
    ${script}
    exit 0;
  fi
  ${scriptPostfix}`
}

export const MicroK8sAppsStatus: AppModel[] = [
  getAppModel('node', 'Node', `${commandPrefix}${nvmProfilePrefix}node --version${nvmProfilePostfix};`),
  getAppModel('npm', 'npm', `${commandPrefix}${nvmProfilePrefix}npm --version${nvmProfilePostfix};`),
  getAppModel('python', 'Python', `${commandPrefix}pip3 --version; ${commandPrefix}python3 --version;`),
  getAppModel('make', 'Make', `${commandPrefix}make --version;`),
  getAppModel('git', 'Git', `${commandPrefix}git --version;`),
  getAppModel('docker', 'Docker', `${commandPrefix}docker --version;`),
  getAppModel('dockercompose', 'Docker Compose', `${commandPrefix}docker-compose --version;`),
  getAppModel('mysql', 'MySql', `${commandPrefix}docker top xrengine_minikube_db;`),
  getAppModel('kubectl', 'kubectl', `${commandPrefix}kubectl version --client --output=yaml;`),
  getAppModel('helm', 'Helm', `${commandPrefix}helm version;`),
  getAppModel(
    'microk8s',
    'MicroK8s',
    microk8sDependantScript(`${microk8sPrefix}microk8s version;${microk8sPrefix}microk8s status;`)
  ),
  getAppModel(
    'ingress',
    'Ingress',
    microk8sDependantScript(
      "kubectl exec -i -n ingress $(kubectl get pods -n ingress -l name=nginx-ingress-microk8s --field-selector=status.phase==Running -o jsonpath='{.items[0].metadata.name}') -- /nginx-ingress-controller --version;"
    )
  ),
  getAppModel('redis', 'Redis', microk8sDependantScript(`helm status local-redis;`)),
  getAppModel('agones', 'Agones', microk8sDependantScript(`helm status agones;`)),
  getAppModel(
    'fileserver',
    'Local File Server',
    `${scriptPrefix}
  if lsof -Pi :8642 -sTCP:LISTEN -t >/dev/null ; then
    echo 'File server configured:';
    lsof -Pi :8642 -sTCP:LISTEN;
    exit 0;
  else
    echo 'File server not configured' >&2;
    exit 1;
  fi
  ${scriptPostfix}`
  ),
  getAppModel(
    'hostfile',
    'Hostfile',
    os.type() === 'Windows_NT'
      ? `
      $content = Get-Content "$env:SystemRoot\\System32\\drivers\\etc\\hosts"
      $wslIps = wsl hostname -I

      if ($wslIps -like "* *") {
      	$wslIp = $wslIps.split(" ")[0]

        if ($content -like "*local.etherealengine.com*") {
          if ($content -like "*$wslIp*") {
              Write-Host "*.etherealengine.com entries exists"
          } else {
              throw "*.etherealengine.com entries outdated"
          }
        } else {
          throw "*.etherealengine.com entries does not exist"
        }

        if ($content -like "*microk8s.registry*") {
          if ($content -like "*$wslIp*") {
              Write-Host "microk8s.registry entries exists"
          } else {
              throw "microk8s.registry entries outdated"
          }
        } else {
          throw "microk8s.registry entries does not exist"
        }
      } else {
      	throw "Kindly make sure WSL is installed and Ubuntu distro is set as default."
      }
      `
      : microk8sDependantScript(
          `
      if grep -q 'local.etherealengine.com' /etc/hosts; then
          if grep -q '127.0.0.1 local.etherealengine.com' /etc/hosts; then
              echo '*.etherealengine.com entries exists'
              exit 0;
          else
            echo '*.etherealengine.com entries outdated' >&2;
            exit 1;
          fi
      else
        echo '*.etherealengine.com entries does not exist' >&2;
        exit 1;
      fi
    `
        )
  ),
  getAppModel('engine', 'Ethereal Engine', microk8sDependantScript(`helm status local;`))
]

export const MicroK8sRippleAppsStatus: AppModel[] = [
  getAppModel(
    'rippled',
    'Rippled',
    microk8sDependantScript(`${commandPrefix}helm status local-rippled;`),
    undefined,
    undefined,
    undefined,
    true
  ),
  getAppModel(
    'ipfs',
    'IPFS',
    microk8sDependantScript(`${commandPrefix}helm status local-ipfs;`),
    undefined,
    undefined,
    undefined,
    true
  )
]
