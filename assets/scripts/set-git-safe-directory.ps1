
#=========================
# Set directory as safe
#=========================

$wslPath = '///wsl$/';
$wslLocalPath = '///wsl.localhost/';

for ( $i = 0; $i -lt $args.count; $i += 2 ) {
    if ($args[$i] -eq "-e") {
        $ENGINE_FOLDER = $args[$i + 1].Trim("'") 
    }
    elseif ($args[$i] -eq "-o") {
        $OPS_FOLDER = $args[$i + 1].Trim("'") 
    }
    elseif ($args[$i] -eq "-d") {
        $DISTRO = $args[$i + 1].Trim("'") 
    }
    elseif ($args[$i] -eq "-es") {
        $IS_ENGINE_SAFE = $args[$i + 1]
    }
    elseif ($args[$i] -eq "-os") {
        $IS_OPS_SAFE = $args[$i + 1]
    }
    else {
        throw "Invalid argument passed"
        exit 1
    }
}

if ($IS_ENGINE_SAFE -eq $false) {
    $localEnginePathCommand = "git config --global --add safe.directory '%(prefix)$wslPath$DISTRO$ENGINE_FOLDER'";
    $localhostEnginePathCommand = "git config --global --add safe.directory '%(prefix)$wslLocalPath$DISTRO$ENGINE_FOLDER'";

    Write-Host "Running git command: $localhostEnginePathCommand";
    Invoke-Expression "& $localhostEnginePathCommand";
    Write-Host "Running git command: $localEnginePathCommand";
    Invoke-Expression "& $localEnginePathCommand";
}

if ($IS_OPS_SAFE -eq $false) {
    $localOpsPathCommand = "git config --global --add safe.directory '%(prefix)$wslPath$DISTRO$OPS_FOLDER'";
    $localhostOpsPathCommand = "git config --global --add safe.directory '%(prefix)$wslLocalPath$DISTRO$OPS_FOLDER'";

    Write-Host "Running git command: $localhostOpsPathCommand";
    Invoke-Expression "& $localhostOpsPathCommand";
    Write-Host "Running git command: $localOpsPathCommand";
    Invoke-Expression "& $localOpsPathCommand";
}

exit 0;