// Disable no-unused-vars, broken for spread args

/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import Channels from '../constants/Channels'

/**
 * https://stackoverflow.com/a/46619982
 * @param {*} node
 * @returns
 */
const getNodes = (node: any) => {
  if (node == null) return null
  if (typeof node !== 'object') {
    return [node] as string[]
  }
  var arr: string[] = []
  var array_node = Object.keys(node).map(function (key) {
    return node[key]
  })
  for (var i = 0; i < array_node.length; i++) {
    Array.prototype.push.apply(arr, getNodes(array_node[i]) || [])
  }
  return arr
}

const validChannels = getNodes(Channels) || []

const electronHandler = {
  async invoke(channel: string, ...args: any[]) {
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args)
    }
  },
  on(channel: string, func: (...args: any[]) => void) {
    if (validChannels.includes(channel)) {
      const subscription = (_event: IpcRendererEvent, ...args: any[]) => func(...args)
      ipcRenderer.on(channel, subscription)

      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    }
    return
  },
  once(channel: string, func: (...args: any[]) => void) {
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args))
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronHandler)

export type ElectronHandler = typeof electronHandler
