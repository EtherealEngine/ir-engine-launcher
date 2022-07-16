/**
 * https://stackoverflow.com/a/8809472/2077741
 * @returns
 */
export const generateUUID = () => {
  let d = new Date().getTime() //Timestamp
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0 //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const Storage = {
  COLOR_MODE: 'COLOR_MODE',
  FORCE_DB_REFRESH: 'FORCE_DB_REFRESH',
  AUTH_SECRET_KEY: 'AUTH_SECRET_UUID_OR_SIMILAR',
  SNS_TOPIC_NAME_KEY: 'SNS_TOPIC_NAME',
  AWS_ACCOUNT_ID_KEY: 'AWS_ACCOUNT_ID',
  AWS_SMS_TOPIC_KEY: 'AWS_SMS_TOPIC_ARN',
  IPFS_CLUSTER_SECRET: 'IPFS_CLUSTER_SECRET',
  IPFS_BOOTSTRAP_PEER_ID: 'IPFS_BOOTSTRAP_PEER_ID',
  IPFS_BOOTSTRAP_PEER_PRIVATE_KEY: 'IPFS_BOOTSTRAP_PEER_PRIVATE_KEY',
  ENABLE_RIPPLE_STACK: 'ENABLE_RIPPLE_STACK',
  XRENGINE_PATH: 'XRENGINE_PATH',
  CONFIGS_TABLE: 'configs',
  VARS_TABLE: 'vars',
  PASSWORD_KEY: generateUUID()
}

export default Storage
