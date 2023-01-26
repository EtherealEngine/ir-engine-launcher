const Endpoints = {
  ALLOW_CERTIFICATES: [
    'local.etherealengine.com', // Client
    'api-local.etherealengine.com', // API Server
    'instanceserver-local.etherealengine.com', // Instance Server
    'localhost:8642', // File Server
    'localhost:10443' // Microk8s Dashboard
  ],
  MYSQL_PORT: 3304,
  DEFAULT_ENGINE_FOLDER: 'xrengine',
  Urls: {
    HOST: 'https://etherealengine.com',
    ADMIN_PORTAL: 'https://local.etherealengine.com/admin',
    LOGIN_PAGE: 'https://local.etherealengine.com/',
    LAUNCH_PAGE: 'https://local.etherealengine.com/location/apartment',
    ENGINE_ENV_DEFAULT: 'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/.env.local.default',
    MINIKUBE_LINUX_SCRIPT:
      'https://raw.githubusercontent.com/XRFoundation/XREngine-Control-Center/master/assets/scripts/configure-minikube-linux.sh',
    MICROK8S_LINUX_SCRIPT:
      'https://raw.githubusercontent.com/XRFoundation/XREngine-Control-Center/master/assets/scripts/configure-microk8s-linux.sh',
    MINIKUBE_VALUES_TEMPLATE:
      'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/configs/local.minikube.template.values.yaml',
    MICROK8S_VALUES_TEMPLATE:
      'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/configs/local.microk8s.template.values.yaml',
    RIPPLED_CLI_DOCS: 'https://xrpl.org/commandline-usage.html',
    IPFS_VALUES_TEMPLATE: 'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/ipfs/values.yaml'
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
      'https://xrfoundation.github.io/ethereal-engine-docs/docs/devops_deployment/microk8s_windows/#install-windows-subsystem-for-linux-wsl',
    INSTALL_DOCKER:
      'https://xrfoundation.github.io/ethereal-engine-docs/docs/devops_deployment/microk8s_windows/#install-docker-desktop'
  }
}

export default Endpoints
