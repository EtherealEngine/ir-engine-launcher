import log from 'electron-log'
import sqlite from 'sqlite3'

import Storage from '../constants/Storage'

const sqlite3 = sqlite.verbose()
const db = new sqlite3.Database('xrengine.db')

export const initDB = async () => {
  try {
    await createTable(Storage.PATHS_TABLE, 'id TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL,', 'id')
    await createTable(Storage.VARS_TABLE, 'id TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL,', 'id')

    log.info('Initialized database.')
    return true
  } catch (err) {
    log.error('Failed to initialize database.', err)
    return false
  }
}

export const insertOrUpdateValue = async (tableName: string, id: string, value: string) => {
  try {
    const sql = `
        INSERT INTO ${tableName} (id, value)
        VALUES($id, $value) 
        ON CONFLICT(id) 
        DO UPDATE SET value=excluded.value;
        `

    const params = {
      $id: id,
      $value: value
    }
    const resSql = await runQuery(sql, params)
    if (resSql) {
      log.info(resSql)
    }
  } catch (err) {
    log.error('Failed to insertOrUpdate in database.', err)
    throw err
  }
}

export const getAllValues = async (tableName: string) => {
  try {
    const sql = `SELECT * FROM ${tableName}`
    const resSql = await allQuery(sql)

    return resSql
  } catch (err) {
    log.error('Failed to getAllValues in database.', err)
    return []
  }
}

export const getValue = async (tableName: string, id: string) => {
  try {
    const sql = `SELECT * FROM ${tableName} WHERE id=$id`
    const params = {
      $id: id
    }
    const resSql = await allQuery(sql, params)

    if (resSql && resSql.length > 0) {
      return resSql[0]
    }
  } catch (err) {
    log.error('Failed to getAllValues in database.', err)
  }
  return undefined
}

/**
 * https://stackoverflow.com/a/15915513/2077741
 * @param tableName
 * @param columns
 * @param idName
 */
const createTable = async (tableName: string, columns: string, idName: string) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        ${columns}
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastupdated DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `
  const triggerSql = `
    CREATE TRIGGER IF NOT EXISTS update_${tableName}_updatetime
        BEFORE UPDATE
            ON ${tableName}
    BEGIN
        UPDATE ${tableName}
        SET lastupdated = CURRENT_TIMESTAMP
        WHERE ${idName} = old.${idName};
    END;
    `
  const resSql = await runQuery(sql)
  if (resSql) {
    log.info(resSql)
  }
  const resTrigger = await runQuery(triggerSql)
  if (resTrigger) {
    log.info(resTrigger)
  }
}

const runQuery = async (sql: string, params?: any) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (res: sqlite.RunResult, err: Error | null) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

const allQuery = async (sql: string, params?: any) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: any[]) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
