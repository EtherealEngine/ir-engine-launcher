import CryptoJS from 'crypto-js'

import Storage from '../constants/Storage'

export const delay = (delayMs: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2)
    }, delayMs)
  })
}

export const decryptPassword = (encryptedPassword: string) => {
  if (encryptedPassword) {
    let decrypted = CryptoJS.AES.decrypt(encryptedPassword, Storage.PASSWORD_KEY).toString(CryptoJS.enc.Utf8)
    decrypted = decrypted.startsWith('"') ? decrypted.substring(1) : decrypted
    decrypted = decrypted.endsWith('"') ? decrypted.substring(0, decrypted.length - 1) : decrypted

    return decrypted
  }

  return ''
}
