const Channels = {
  Shell: {
    CheckMinikubeConfig: 'CheckMinikubeConfig',
    CheckSystemStatusResult: 'CheckSystemStatusResult',
    CheckAppStatusResult: 'CheckAppStatusResult',
    CheckClusterStatusResult: 'CheckClusterStatusResult',
    ConfigureMinikubeConfig: 'ConfigureMinikubeConfig',
    ConfigureMinikubeDashboard: 'ConfigureMinikubeDashboard',
    ConfigureMinikubeDashboardError: 'ConfigureMinikubeDashboardError',
    ConfigureMinikubeDashboardResponse: 'ConfigureMinikubeDashboardResponse',
    CheckSudoPassword: 'CheckSudoPassword',
  },
  Utilities: {
    CopyClipboard: 'CopyClipboard',
    GetVersion: 'GetVersion',
    OpenExternal: 'OpenExternal',
    OpenPath: 'OpenPath',
    SelectFolder: 'SelectFolder',
    Log: 'Log',
    SaveLog: 'SaveLog',
  },
  XREngine: {
    EnsureAdminAccess: 'EnsureAdminAccess',
    EnsureAdminAccessError: 'EnsureAdminAccessError',
    EnsureAdminAccessResponse: 'EnsureAdminAccessResponse'
  },
  Settings: {
    CheckConfigs: 'CheckConfigs',
    CheckVars: 'CheckVars',
    SaveConfigs: 'SaveConfigs',
    SaveVars: 'SaveVars'
  },
  Updates: {
    CheckUpdate: 'CheckUpdate',
    DownloadUpdate: 'DownloadUpdate',
    DownloadProgress: 'DownloadProgress',
    LaunchApp: 'LaunchApp',
    QuitAndUpdate: 'QuitAndUpdate',
  }
}

module.exports.Channels = Channels
