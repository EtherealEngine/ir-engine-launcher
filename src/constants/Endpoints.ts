const Endpoints = {
  HOST: 'https://etherealengine.org',
  ADMIN_PORTAL: 'https://local.etherealengine.org/admin',
  LOGIN_PAGE: 'https://local.etherealengine.org/',
  LAUNCH_PAGE: 'https://local.etherealengine.org/location/apartment',
  ALLOW_CERTIFICATES: ['local.etherealengine.org', 'api-local.etherealengine.org', 'instanceserver-local.etherealengine.org'],
  MYSQL_PORT: 3304,
  DEFAULT_ENGINE_FOLDER: 'etherealengine',
  DB_FILE_NAME: 'etherealengine.db',
  VALIDATOR_FILE_PATH: 'packages/ops/rippled/config/validators.txt',
  VALIDATOR_TEMPLATE_PATH: 'packages/ops/rippled/config/validators.template.txt',
  RIPPLED_FILE_PATH: 'packages/ops/rippled/config/rippled.cfg',
  RIPPLED_TEMPLATE_PATH: 'packages/ops/rippled/config/rippled.template.cfg',
  ENGINE_ENV_DEFAULT_PATH: '.env.local.default',
  ENGINE_ENV_DEFAULT_URL: 'https://raw.githubusercontent.com/etherealengine/etherealengine/dev/.env.local.default',
  ENGINE_VALUES_FILE_NAME: 'etherealengine.values.yaml',
  ENGINE_VALUES_TEMPLATE_PATH: 'packages/ops/configs/local.template.values.yaml',
  ENGINE_VALUES_TEMPLATE_URL:
    'https://raw.githubusercontent.com/etherealengine/etherealengine/dev/packages/ops/configs/local.template.values.yaml',
  IPFS_VALUES_FILE_NAME: 'ipfs.values.yaml',
  IPFS_VALUES_TEMPLATE_PATH: 'packages/ops/ipfs/values.yaml',
  IPFS_VALUES_TEMPLATE_URL: 'https://raw.githubusercontent.com/etherealengine/etherealengine/dev/packages/ops/ipfs/values.yaml',
  RIPPLED_CLI_DOCS: 'https://xrpl.org/commandline-usage.html'
}

export default Endpoints
