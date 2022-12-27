import { app, BrowserWindow, dialog } from 'electron'
import log from 'electron-log'
import { promises as fs } from 'fs'
import { existsSync } from 'fs'
import path from 'path'

import { Channels } from '../../../constants/Channels'
import Endpoints from '../../../constants/Endpoints'
import Storage from '../../../constants/Storage'
import { DefaultAppsStatus, DefaultRippleAppsStatus } from '../../../models/AppStatus'
import { getAllValues, getValue, insertOrUpdateValue } from '../../managers/StoreManager'
import { findRequiredValues, getEngineDefaultPath, getEnginePath, getYamlDoc } from './Settings-helper'

class Settings {}

export default Settings
