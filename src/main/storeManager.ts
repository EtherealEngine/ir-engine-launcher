import Store from 'electron-store'
import log from 'electron-log'

const store = new Store();

export const insertOrUpdateValue = (tableName: string, id: string, value: string) => {
    try {
        store.set(`${tableName}.${id}`, value)
    } catch (err) {
        log.error('Failed to insertOrUpdate in store.', err)
        throw err
    }
}

export const getAllValues = (tableName: string) => {
    try {
        const data = store.get(tableName) as any
        if (data) {
            return data
        }
    } catch (err) {
        log.error('Failed to getAllValues in store.', err)
    }
    return {}
}

export const getValue = (tableName: string, id: string) => {
    try {
        return store.get(`${tableName}.${id}`) as any
    } catch (err) {
        log.error('Failed to getValue in store.', err)
        return undefined
    }
}

export default store