import log from 'electron-log'
import Store from 'electron-store'

const store = new Store()

export const insertOrUpdateValue = (id: string, value: any) => {
  try {
    store.set(id, value)
  } catch (err) {
    log.error(`Failed to insertOrUpdate ${id} in store.`, err)
    throw err
  }
}

export const getValue = (id: string) => {
  try {
    return store.get(id) as any
  } catch (err) {
    log.error(`Failed to getValue for ${id} in store.`, err)
    return undefined
  }
}

export default store
