const Endpoints = {
  HOST: 'https://xrengine.io',
  ADMIN_PORTAL: 'https://local.theoverlay.io/admin',
  LOGIN_PAGE: 'https://local.theoverlay.io/',
  LAUNCH_PAGE: 'https://local.theoverlay.io/location/test',
  ALLOW_CERTIFICATES: ['local.theoverlay.io', 'api-local.theoverlay.io', 'gameserver-local.theoverlay.io'],
  MYSQL_PORT: 3304,
  DEFAULT_XRENGINE_FOLDER: 'xrengine',
  DB_FILE_NAME: 'xrengine.db',
  VALUES_FILE_NAME: 'local.values.yaml',
  VALUES_TEMPLATE_PATH: 'packages/ops/configs/local.template.values.yaml',
  VALUES_TEMPLATE_URL:
    'https://raw.githubusercontent.com/XRFoundation/XREngine/dev/packages/ops/configs/local.template.values.yaml'
}

export default Endpoints
