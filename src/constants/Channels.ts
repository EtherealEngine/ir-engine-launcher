const Channels = {
  Shell: {
    ConfigureIPFSDashboard: 'ConfigureIPFSDashboard',
    ConfigureIPFSDashboardError: 'ConfigureIPFSDashboardError',
    ConfigureIPFSDashboardResponse: 'ConfigureIPFSDashboardResponse',
    CheckSudoPassword: 'CheckSudoPassword',
    ExecuteRippledCommand: 'ExecuteRippledCommand',
    ExecuteCommand: 'ExecuteCommand'
  },
  Utilities: {
    CopyClipboard: 'CopyClipboard',
    GetAppSysInfo: 'GetAppSysInfo',
    OpenExternal: 'OpenExternal',
    OpenPath: 'OpenPath',
    SelectFolder: 'SelectFolder',
    SelectFile: 'SelectFile',
    Log: 'Log',
    SaveLog: 'SaveLog',
    GetPrerequisites: 'GetPrerequisites',
    CheckPrerequisite: 'CheckPrerequisite'
  },
  Git: {
    GetCurrentConfigs: 'GetCurrentConfigs',
    ChangeBranch: 'ChangeBranch',
    PullBranch: 'PullBranch',
    PushBranch: 'PushBranch'
  },
  Engine: {
    EnsureAdminAccess: 'EnsureAdminAccess',
    EnsureAdminAccessError: 'EnsureAdminAccessError',
    EnsureAdminAccessResponse: 'EnsureAdminAccessResponse'
  },
  Cluster: {
    GetClusterStatus: 'GetClusterStatus',
    CheckClusterStatus: 'CheckClusterStatus',
    CheckSystemStatusResult: 'CheckSystemStatusResult',
    CheckAppStatusResult: 'CheckAppStatusResult',
    CheckEngineStatusResult: 'CheckEngineStatusResult',
    ConfigureK8Dashboard: 'ConfigureK8Dashboard',
    ConfigureK8DashboardError: 'ConfigureK8DashboardError',
    ConfigureK8DashboardResponse: 'ConfigureK8DashboardResponse',
    ConfigureCluster: 'ConfigureCluster'
  },
  Updates: {
    CheckUpdate: 'CheckUpdate',
    DownloadUpdate: 'DownloadUpdate',
    DownloadProgress: 'DownloadProgress',
    LaunchApp: 'LaunchApp',
    QuitAndUpdate: 'QuitAndUpdate'
  },
  ConfigFile: {
    LoadConfig: 'LoadConfig',
    SaveConfig: 'SaveConfig',
    ExportConfig: 'ExportConfig',
    ImportConfig: 'ImportConfig',
    RemoveFiles: 'RemoveFiles',
    GetDefaultConfigs: 'GetDefaultConfigs',
    GetDefaultVariables: 'GetDefaultVariables'
  },
  Workloads: {
    LaunchClient: 'LaunchClient',
    GetReleaseNames: 'GetReleaseNames',
    GetKubeContexts: 'GetKubeContexts',
    GetWorkloads: 'GetWorkloads',
    RemovePod: 'RemovePod',
    GetPodLogs: 'GetPodLogs'
  }
}

export default Channels
