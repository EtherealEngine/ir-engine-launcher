import { AppModel, getAppModel } from '../../../models/AppStatus'

export const WindowsPrerequisites: AppModel[] = [
  getAppModel('wsl', 'Windows Subsystem for Linux (WSL)', 'wsl --status;'),
  getAppModel('wslUbuntu', 'WSL Ubuntu Distributions', 'wsl --status;'),
  getAppModel('dockerDesktop', 'Docker Desktop', 'docker version;'),
  getAppModel('dockerDesktopUbuntu', 'Docker Desktop WSL Ubuntu Integrations', 'wsl docker version;')
]
