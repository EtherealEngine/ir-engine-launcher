
#================================
# Docker MicroK8s Registry access
#================================

$dockerDaemonPath = "$env:UserProfile\.docker\daemon.json"

if (Test-Path $dockerDaemonPath) {
    $dockerDaemonJson = Get-Content $dockerDaemonPath -Raw | ConvertFrom-Json

    if ($dockerDaemonJson.PSobject.Properties.Name -and $dockerDaemonJson.PSobject.Properties.Name.Contains("insecure-registries")) {
        $entryUpdated = $false

        if ($dockerDaemonJson.PSobject.Properties["insecure-registries"].Value -contains "http://microk8s.registry:32000") {
            Write-Host "$dockerDaemonPath with http://microk8s.registry:32000 entry exists"
        }
        else {
            $dockerDaemonJson."insecure-registries" += "http://microk8s.registry:32000"
            $entryUpdated = $true
        }

        if ($dockerDaemonJson.PSobject.Properties["insecure-registries"].Value -contains "microk8s.registry:32000") {
            Write-Host "$dockerDaemonPath with microk8s.registry:32000 entry exists"
        }
        else {
            $dockerDaemonJson."insecure-registries" += "microk8s.registry:32000"
            $entryUpdated = $true
        }

        if ($entryUpdated) {
            Set-Content $dockerDaemonPath ($dockerDaemonJson | ConvertTo-Json)
            Write-Host "$dockerDaemonPath with insecure-registries entries updated"
            exit 1;
        }
    }
    else {
        $dockerDaemonJson | Add-Member -Type NoteProperty -Name 'insecure-registries' -Value @("http://microk8s.registry:32000", "microk8s.registry:32000")
        Set-Content $dockerDaemonPath ($dockerDaemonJson | ConvertTo-Json)
        Write-Host "$dockerDaemonPath with insecure-registries entries updated"
        exit 1;
    }
}
else {
    $dockerDaemonJson = @{
        "insecure-registries" = @("http://microk8s.registry:32000", "microk8s.registry:32000")
    }
    Set-Content $dockerDaemonPath ($dockerDaemonJson | ConvertTo-Json)
    Write-Host "$dockerDaemonPath with insecure-registries entries created"
    exit 1;
}
