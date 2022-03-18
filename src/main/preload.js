const Channels = require('../constants/Channels.js')
const { contextBridge, ipcRenderer } = require('electron')

/**
 * https://stackoverflow.com/a/46619982
 * @param {*} node
 * @returns
 */
const getNodes = (node) => {
  if (node == null) return null
  if (typeof node !== 'object') {
    return [node]
  }
  var arr = []
  var array_node = Object.keys(node).map(function (key) {
    return node[key]
  })
  for (var i = 0; i < array_node.length; i++) {
    Array.prototype.push.apply(arr, getNodes(array_node[i]))
  }
  return arr
}

const validChannels = getNodes(Channels)

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: async (channel, ...args) => {
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args)
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args))
    }
  }
})
