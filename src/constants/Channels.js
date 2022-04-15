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
    OpenExternal: 'OpenExternal',
    OpenPath: 'OpenPath',
    Log: 'Log',
    SaveLog: 'SaveLog',
  },
  XREngine: {
    EnsureAdminAccess: 'EnsureAdminAccess',
    EnsureAdminAccessError: 'EnsureAdminAccessError',
    EnsureAdminAccessResponse: 'EnsureAdminAccessResponse'
  }
}

module.exports.Channels = Channels
