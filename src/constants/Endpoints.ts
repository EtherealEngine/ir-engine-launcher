const Endpoints = {
  ALLOW_CERTIFICATES: [
    'local.etherealengine.org', // Client
    'api-local.etherealengine.org', // API Server
    'instanceserver-local.etherealengine.org', // Instance Server
    'localhost:8642', // File Server
    'localhost:10443' // Microk8s Dashboard
  ],
  MYSQL_PORT: 3304,
  DEFAULT_ENGINE_FOLDER: 'etherealengine',
  Urls: {
    HOST: 'https://etherealengine.org',
    ADMIN_PORTAL: 'https://local.etherealengine.org/admin',
    LOGIN_PAGE: 'https://local.etherealengine.org/',
    LAUNCH_PAGE: 'https://local.etherealengine.org/location/apartment',
    ENGINE_ENV_DEFAULT: 'https://raw.githubusercontent.com/etherealengine/etherealengine/dev/.env.local.default',
    MINIKUBE_LINUX_SCRIPT:
      'https://raw.githubusercontent.com/etherealengine/ethereal-engine-control-center/master/assets/scripts/configure-minikube-linux.sh',
    MICROK8S_LINUX_SCRIPT:
      'https://raw.githubusercontent.com/etherealengine/ethereal-engine-control-center/master/assets/scripts/configure-microk8s-linux.sh',
    MICROK8S_WINDOWS_SCRIPT:
      'https://raw.githubusercontent.com/etherealengine/ethereal-engine-control-center/master/assets/scripts/configure-microk8s-windows.ps1',
    MINIKUBE_VALUES_TEMPLATE:
      'https://raw.githubusercontent.com/etherealengine/etherealengine/dev/packages/ops/configs/local.minikube.template.values.yaml',
    MICROK8S_VALUES_TEMPLATE:
      'https://raw.githubusercontent.com/etherealengine/etherealengine/dev/packages/ops/configs/local.microk8s.template.values.yaml',
    RIPPLED_CLI_DOCS: 'https://xrpl.org/commandline-usage.html',
    IPFS_VALUES_TEMPLATE: 'https://raw.githubusercontent.com/etherealengine/etherealengine/dev/packages/ops/ipfs/values.yaml'
  },
  Paths: {
    ENGINE_ENV: '.env.local',
    ENGINE_ENV_DEFAULT: '.env.local.default',
    ENGINE_VALUES_FILE_NAME: 'engine.values.yaml',
    MINIKUBE_VALUES_TEMPLATE: 'packages/ops/configs/local.minikube.template.values.yaml',
    MICROK8S_VALUES_TEMPLATE: 'packages/ops/configs/local.microk8s.template.values.yaml',
    IPFS_VALUES_FILE_NAME: 'ipfs.values.yaml',
    IPFS_VALUES_TEMPLATE: 'packages/ops/ipfs/values.yaml',
    VALIDATOR_FILE: 'packages/ops/rippled/config/validators.txt',
    VALIDATOR_TEMPLATE: 'packages/ops/rippled/config/validators.template.txt',
    RIPPLED_FILE: 'packages/ops/rippled/config/rippled.cfg',
    RIPPLED_TEMPLATE: 'packages/ops/rippled/config/rippled.template.cfg',
    WSL_PREFIX: '\\\\wsl$\\Ubuntu',
    FILE_SERVER: 'packages/server/upload'
  },
  Docs: {
    INSTALL_WSL:
      'https://etherealengine.github.io/ethereal-engine-docs/docs/devops_deployment/microk8s_windows/#install-windows-subsystem-for-linux-wsl',
    INSTALL_DOCKER:
      'https://etherealengine.github.io/ethereal-engine-docs/docs/devops_deployment/microk8s_windows/#install-docker-desktop'
  }
}

export default Endpoints
