/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import path from 'path'
import { URL } from 'url'

export let resolveHtmlPath: (htmlFileName: string, query?: string) => string

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212
  resolveHtmlPath = (htmlFileName: string, query?: string) => {
    const url = new URL(`http://localhost:${port}${query ? `?${query}` : ''}`)
    url.pathname = htmlFileName
    return url.href
  }
} else {
  resolveHtmlPath = (htmlFileName: string, query?: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}${query ? `?${query}` : ''}`
  }
}
