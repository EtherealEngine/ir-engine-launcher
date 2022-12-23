import { BrowserWindow } from 'electron'

// import log from 'electron-log'
import { Channels } from '../../../constants/Channels'
import Endpoints from '../../../constants/Endpoints'
import { delay, exec, executeJS } from '../IBaseHandler'
import { getEnginePath } from '../Settings/Settings-helper'

class Engine {
  static ensureAdminAccess = async (parentWindow: BrowserWindow) => {
    try {
      let adminWindow: BrowserWindow | null = null
      adminWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        show: false,
        parent: parentWindow,
        webPreferences: { webSecurity: false, nodeIntegration: false }
      })

      // To allow Engine certificate errors
      // https://github.com/electron/electron/issues/14885#issuecomment-770953041
      adminWindow.webContents.session.setCertificateVerifyProc((request, callback) => {
        const { hostname } = request
        if (Endpoints.ALLOW_CERTIFICATES.includes(hostname)) {
          callback(0) //this means trust this domain
        } else {
          callback(-3) //use chromium's verification result
        }
      })

      adminWindow.once('ready-to-show', async () => {
        try {
          await delay(3000)

          const userRole = await executeJS(
            'function getUserRole() { return document.getElementById("user-role").innerHTML } getUserRole()',
            adminWindow
          )

          parentWindow.webContents.send(Channels.Utilities.Log, {
            category: 'admin panel',
            message: `User role is ${userRole.trim()}.`
          })

          if (userRole !== 'admin') {
            const userId = await executeJS(
              `const delay = async (delayInms) => { return new Promise(resolve => setTimeout(resolve, delayInms)); }
            const getUserId = async () => { document.getElementById("show-user-id").click(); await delay(1000); return document.getElementById("user-id").value; } 
            getUserId()`,
              adminWindow
            )

            if (!userId) {
              throw 'Failed to find userId.'
            }

            parentWindow.webContents.send(Channels.Utilities.Log, {
              category: 'admin panel',
              message: `Making ${userId} admin.`
            })

            const enginePath = await getEnginePath()
            const response = await exec(
              `export MYSQL_PORT=${Endpoints.MYSQL_PORT};cd ${enginePath};npm run make-user-admin -- --id=${userId}`
            )
            const { error } = response

            if (error) {
              throw JSON.stringify(error)
            }
          }

          parentWindow.webContents.send(Channels.Engine.EnsureAdminAccessResponse)
        } catch (err) {
          parentWindow.webContents.send(Channels.Utilities.Log, { category: 'admin panel', message: JSON.stringify(err) })
          parentWindow.webContents.send(
            Channels.Engine.EnsureAdminAccessError,
            `Failed to load admin panel. Please check logs.`
          )
        }

        adminWindow?.destroy()
      })

      adminWindow.on('closed', () => {
        adminWindow = null
      })

      await adminWindow.loadURL(Endpoints.LOGIN_PAGE)
      // adminWindow.show()
    } catch (err) {
      parentWindow.webContents.send(Channels.Utilities.Log, {
        category: 'admin panel',
        message: JSON.stringify(err)
      })
      parentWindow.webContents.send(
        Channels.Engine.EnsureAdminAccessError,
        `Failed to load admin panel. Please check logs.`
      )
    }
  }
}

export default Engine
