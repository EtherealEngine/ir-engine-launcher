
#==========
# Functions
#==========

function checkExitCode() { 
    if ($LastExitCode -ne 0) {
        exit $LastExitCode;
    }
}
function cleanseString($inputSt) { 
    $finalString = ''
    $inputString = $inputSt -join "`n" | Out-String
    
    for ($index = 0; $index -lt $inputString.Length; $index++) {
        $codePoints = [int][char]$inputString[$index]
        if ($codePoints -ne 0) {
            $finalString += $inputString[$index]
        }
    }

    return $finalString
}

#===========
# Parameters
#===========
# Ref: https://www.red-gate.com/simple-talk/sysadmin/powershell/how-to-use-parameters-in-powershell/

for ( $i = 0; $i -lt $args.count; $i += 2 ) {
    if ($args[$i] -eq "-a") {
        $ASSETS_FOLDER = $args[$i + 1]
        $SCRIPTS_FOLDER = "$ASSETS_FOLDER/scripts"
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

#==============
# Prerequisites
#==============

$wslStatus = cleanseString(wsl --status);
Write-Host "WSL Status: `n$wslStatus";

if ([string]::IsNullOrEmpty($wslStatus) -or $wslStatus -notlike '*Default Distribution: Ubuntu*') {
    throw "Make sure WSL is installed and Ubuntu is selected as default distribution.`nhttps://xrfoundation.github.io/ethereal-engine-docs/docs/devops_deployment/microk8s_windows/#install-windows-subsystem-for-linux-wsl";
    exit 1;
}

$dockerVersion = cleanseString(docker version);
Write-Host "Docker Version: `n$dockerVersion";
$wslDockerVersion = cleanseString(wsl docker version);
Write-Host "WSL Docker version: `n$wslDockerVersion";

if ($dockerVersion -notlike '*Server: Docker Desktop*' -or $wslDockerVersion -notlike '*Server: Docker Desktop*') {
    throw "Make sure Docker Desktop is installed and Ubuntu WSL Integration is enabled.`nhttps://xrfoundation.github.io/ethereal-engine-docs/docs/devops_deployment/microk8s_windows/#install-docker-desktop";
    exit 1;
}

#==========
# WSL Login
#==========

wsl bash "$SCRIPTS_FOLDER/check-login.sh" "$PASSWORD"

checkExitCode;


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

