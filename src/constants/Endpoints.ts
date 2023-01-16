const Endpoints = {
  HOST: 'https://etherealengine.com',
  ADMIN_PORTAL: 'https://local.etherealengine.com/admin',
  LOGIN_PAGE: 'https://local.etherealengine.com/',
  LAUNCH_PAGE: 'https://local.etherealengine.com/location/apartment',
  ALLOW_CERTIFICATES: [
    'local.etherealengine.com', // Client
    'api-local.etherealengine.com', // API Server
    'instanceserver-local.etherealengine.com', // Instance Server
    'localhost:8642', // File Server
    'localhost:10443' // Microk8s Dashboard
  ],
  MYSQL_PORT: 3304,
  DEFAULT_ENGINE_FOLDER: 'xrengine',
  VALIDATOR_FILE_PATH: 'packages/ops/rippled/config/validators.txt',
  VALIDATOR_TEMPLATE_PATH: 'packages/ops/rippled/config/validators.template.txt',
  RIPPLED_FILE_PATH: 'packages/ops/rippled/config/rippled.cfg',
  RIPPLED_TEMPLATE_PATH: 'packages/ops/rippled/config/rippled.template.cfg',
  ENGINE_ENV_PATH: '.env.local',
  ENGINE_ENV_DEFAULT_PATH: '.env.local.default',
  ENGINE_ENV_DEFAULT_URL: 'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/.env.local.default',
  ENGINE_VALUES_FILE_NAME: 'engine.values.yaml',
  MINIKUBE_LINUX_SCRIPT_URL:
    'https://raw.githubusercontent.com/XRFoundation/XREngine-Control-Center/master/assets/scripts/configure-minikube-linux.sh',
  MICROK8S_LINUX_SCRIPT_URL:
    'https://raw.githubusercontent.com/XRFoundation/XREngine-Control-Center/master/assets/scripts/configure-microk8s-linux.sh',
  MINIKUBE_VALUES_TEMPLATE_PATH: 'packages/ops/configs/local.minikube.template.values.yaml',
  MINIKUBE_VALUES_TEMPLATE_URL:
    'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/configs/local.minikube.template.values.yaml',
  MICROK8S_VALUES_TEMPLATE_PATH: 'packages/ops/configs/local.microk8s.template.values.yaml',
  MICROK8S_VALUES_TEMPLATE_URL:
    'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/configs/local.microk8s.template.values.yaml',
  IPFS_VALUES_FILE_NAME: 'ipfs.values.yaml',
  IPFS_VALUES_TEMPLATE_PATH: 'packages/ops/ipfs/values.yaml',
  IPFS_VALUES_TEMPLATE_URL: 'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/ipfs/values.yaml',
  RIPPLED_CLI_DOCS: 'https://xrpl.org/commandline-usage.html',
  FILE_SERVER_PATH: 'packages/server/upload'
}

export default Endpoints
