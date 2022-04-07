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
  },
  Utilities: {
    CopyClipboard: 'CopyClipboard',
    Log: 'Log'
  },
  XREngine: {
    EnsureAdminAccess: 'EnsureAdminAccess',
    EnsureAdminAccessError: 'EnsureAdminAccessError',
    EnsureAdminAccessResponse: 'EnsureAdminAccessResponse'
  }
}

module.exports.Channels = Channels
