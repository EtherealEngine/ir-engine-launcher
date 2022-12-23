const Channels = {
  Shell: {
    CheckMinikubeConfig: 'CheckMinikubeConfig',
    CheckMinikubeAppConfig: 'CheckMinikubeAppConfig',
    CheckSystemStatusResult: 'CheckSystemStatusResult',
    CheckAppStatusResult: 'CheckAppStatusResult',
    CheckEngineStatusResult: 'CheckK8DashboardStatusResult',
    ConfigureMinikubeConfig: 'ConfigureMinikubeConfig',
    ConfigureMinikubeDashboard: 'ConfigureMinikubeDashboard',
    ConfigureMinikubeDashboardError: 'ConfigureMinikubeDashboardError',
    ConfigureMinikubeDashboardResponse: 'ConfigureMinikubeDashboardResponse',
    ConfigureIPFSDashboard: 'ConfigureIPFSDashboard',
    ConfigureIPFSDashboardError: 'ConfigureIPFSDashboardError',
    ConfigureIPFSDashboardResponse: 'ConfigureIPFSDashboardResponse',
    CheckSudoPassword: 'CheckSudoPassword',
    ExecuteRippledCommand: 'ExecuteRippledCommand',
    ExecuteCommand: 'ExecuteCommand',
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
  Engine: {
    EnsureAdminAccess: 'EnsureAdminAccess',
    EnsureAdminAccessError: 'EnsureAdminAccessError',
    EnsureAdminAccessResponse: 'EnsureAdminAccessResponse'
  },
  Settings: {
    CheckConfigs: 'CheckConfigs',
    CheckVars: 'CheckVars',
    GetCurrentAppConfigs: 'GetCurrentAppConfigs',
    SaveConfigs: 'SaveConfigs',
    SaveVars: 'SaveVars',
    ExportSettings: "ExportSettings",
    ImportSettings: "ImportSettings"
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
