import { AppModel, getAppModel } from '../../../models/AppStatus'

export const WindowsPrerequisites: AppModel[] = [
  getAppModel('wsl', 'Windows Subsystem for Linux (WSL)', 'wsl --status;', false),
  getAppModel('wslUbuntu', 'WSL Ubuntu Distribution', 'wsl --list --quiet Ubuntu;', false),
  getAppModel('wslUbuntuStore', 'WSL Ubuntu Distribution from Windows Store', 'wsl --list --quiet Ubuntu-20.04;', false),
  getAppModel('dockerDesktop', 'Docker Desktop', 'docker version;', false),
  getAppModel('dockerDesktopUbuntu', 'Docker Desktop WSL Ubuntu Integration', 'wsl docker version;', false)
]
