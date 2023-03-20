/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import path from 'path'
import { URL } from 'url'

export function resolveHtmlPath(htmlFileName: string, query?: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212
    const url = new URL(`http://localhost:${port}${query ? `?${query}` : ''}`)
    url.pathname = htmlFileName
    return url.href
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}${query ? `?${query}` : ''}`
}
