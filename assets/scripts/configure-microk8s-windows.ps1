
#===========
# Parameters
#===========
# Ref: https://www.red-gate.com/simple-talk/sysadmin/powershell/how-to-use-parameters-in-powershell/

for ( $i = 0; $i -lt $args.count; $i += 2 ) {
    if ($args[$i] -eq "-a") {
        $ASSETS_FOLDER = $args[$i + 1]
    }
    elseif ($args[$i] -eq "-c") {
        $CONFIGS_FOLDER = $args[$i + 1]
    }
    elseif ($args[$i] -eq "-d") {
        $FORCE_DB_REFRESH = $args[$i + 1]
    }
    elseif ($args[$i] -eq "-f") {
        $ENGINE_FOLDER = $args[$i + 1]
    }
    elseif ($args[$i] -eq "-i") {
        $CLUSTER_ID = $args[$i + 1]
    }
    elseif ($args[$i] -eq "-p") {
        $PASSWORD = $args[$i + 1]
    }
    elseif ($args[$i] -eq "-r") {
        $ENABLE_RIPPLE_STACK = $args[$i + 1]
    }
    else {
        throw "Invalid argument passed"
        exit 1
    }
}

if ([string]::IsNullOrEmpty($ASSETS_FOLDER) -or 
    [string]::IsNullOrEmpty($CONFIGS_FOLDER) -or 
    [string]::IsNullOrEmpty($FORCE_DB_REFRESH) -or 
    [string]::IsNullOrEmpty($ENGINE_FOLDER) -or 
    [string]::IsNullOrEmpty($CLUSTER_ID) -or 
    [string]::IsNullOrEmpty($PASSWORD) -or 
    [string]::IsNullOrEmpty($ENABLE_RIPPLE_STACK)) {
    throw "Missing arguments"
    exit 1
}

# Reference: https://stackoverflow.com/a/52628883/2077741
# $processes = Get-Process "*Docker Desktop*"
# if ($processes.Count -gt 0)
# {
#     $processes[0].Kill()
#     $processes[0].WaitForExit()
# }
# Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"


# $status = wsl bash -c "echo '111Hanzla' | sudo -S /snap/bin/microk8s status"

# Write-Host $status
    
# if ($status) {
#     Write-Host "Installed"
# } else {
#     Write-Host "Not Installed"
# }

# wsl bash -c "echo '111Hanzla' | sudo -S /snap/bin/microk8s status"

# wsl bash -c "echo '111Hanzla' | sudo -S /snap/bin/microk8s start"