const Endpoints = {
  HOST: 'https://xrengine.io',
  ADMIN_PORTAL: 'https://local.theoverlay.io/admin',
  LOGIN_PAGE: 'https://local.theoverlay.io/',
  LAUNCH_PAGE: 'https://local.theoverlay.io/location/apartment',
  ALLOW_CERTIFICATES: ['local.theoverlay.io', 'api-local.theoverlay.io', 'instanceserver-local.theoverlay.io'],
  MYSQL_PORT: 3304,
  DEFAULT_XRENGINE_FOLDER: 'xrengine',
  DB_FILE_NAME: 'xrengine.db',
  VALIDATOR_FILE_PATH: 'packages/ops/rippled/config/validators.txt',
  VALIDATOR_TEMPLATE_PATH: 'packages/ops/rippled/config/validators.template.txt',
  RIPPLED_FILE_PATH: 'packages/ops/rippled/config/rippled.cfg',
  RIPPLED_TEMPLATE_PATH: 'packages/ops/rippled/config/rippled.template.cfg',
  ENGINE_VALUES_FILE_NAME: 'xrengine.values.yaml',
  ENGINE_VALUES_TEMPLATE_PATH: 'packages/ops/configs/local.template.values.yaml',
  ENGINE_VALUES_TEMPLATE_URL:
    'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/configs/local.template.values.yaml',
  IPFS_VALUES_FILE_NAME: 'ipfs.values.yaml',
  IPFS_VALUES_TEMPLATE_PATH: 'packages/ops/ipfs/values.yaml',
  IPFS_VALUES_TEMPLATE_URL: 'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/ipfs/values.yaml',
  RIPPLED_CLI_DOCS: 'https://xrpl.org/commandline-usage.html'
}

export default Endpoints
