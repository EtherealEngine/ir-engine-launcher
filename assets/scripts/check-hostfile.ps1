
#==========
# Functions
# Ref: https://stackoverflow.com/a/24992975
#==========

function Test-FileLock {
    param (
        [parameter(Mandatory = $true)][string]$Path
    )
  
    $oFile = New-Object System.IO.FileInfo $Path
  
    if ((Test-Path -Path $Path) -eq $false) {
        return $false
    }
  
    try {
        $oStream = $oFile.Open([System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
  
        if ($oStream) {
            $oStream.Close()
        }
        return $false
    }
    catch {
        Write-Host "An error occurred:"
        Write-Host $_
        # file is locked by a process.
        return $true
    }
}


#===========
# Parameters
#===========

Write-Host "Checking hostfile for etherealengine entries";

$EXITCODE = 0;
$IS_READONLY = $false;

if ($args[0] -eq 'readonly') {
    $IS_READONLY = $true;
}

Write-Host "Readonly: $IS_READONLY";

#=======================
# Update system hostfile
#=======================

try {
    $hostFilePath = "$env:windir\System32\drivers\etc\hosts";
    $wslIp = wsl hostname -I;
    if ($wslIp -like "* *") {
        $wslIp = $wslIp.split(" ")[0]
    }
    
    if (Test-Path $hostFilePath) {
        #Ref: https://stackoverflow.com/a/7976784
        $hostFileContent = [System.IO.File]::ReadAllText($hostFilePath);
    
        if ($IS_READONLY -eq $false) {
            # Added this to avoid file in user error.
            $fileLocked = Test-FileLock -Path $hostFilePath
            while ($fileLocked -eq $true) {
                Write-Host "hostfile is locked. Waiting for 2 secs.";
    
                Start-Sleep -Seconds 2;
    
                $fileLocked = Test-FileLock -Path $hostFilePath
            }
        }
    
        if ($hostFileContent -like "*local.etherealengine.org*") {
            if ($hostFileContent -like "*$wslIp local.etherealengine.org*") {
                Write-Host "*.etherealengine.org host entry exists";
            }
            else {
                Write-Host "*.etherealengine.org host entry outdated";
    
                $EXITCODE = 1
                if ($IS_READONLY -eq $false) {
                    #Ref: https://shellgeek.com/read-file-line-by-line-in-powershell/
                    #Ref: https://stackoverflow.com/a/21970035
                    $updatedContent = [System.IO.File]::ReadAllLines($hostFilePath);
                    $linenumber = $updatedContent | select-string "local.etherealengine.org";
                    $updatedContent[$linenumber.LineNumber - 1] = "$wslIp local.etherealengine.org api-local.etherealengine.org instanceserver-local.etherealengine.org 00000.instanceserver-local.etherealengine.org 00001.instanceserver-local.etherealengine.org 00002.instanceserver-local.etherealengine.org 00003.instanceserver-local.etherealengine.org";

                    # Added this to avoid file in user error.
                    $fileLocked = Test-FileLock -Path $hostFilePath
                    while ($fileLocked -eq $true) {
                        Write-Host "hostfile is locked. Waiting for 2 secs.";
    
                        Start-Sleep -Seconds 2;
    
                        $fileLocked = Test-FileLock -Path $hostFilePath
                    }

                    [System.IO.File]::WriteAllLines($hostFilePath, $updatedContent);
                }
            }
        }
        else {
            Write-Host "*.etherealengine.org host entry needs to be added";
    
            $EXITCODE = 1
            if ($IS_READONLY -eq $false) {
                Add-Content -Path $hostFilePath -value "`n$wslIp local.etherealengine.org api-local.etherealengine.org instanceserver-local.etherealengine.org 00000.instanceserver-local.etherealengine.org 00001.instanceserver-local.etherealengine.org 00002.instanceserver-local.etherealengine.org 00003.instanceserver-local.etherealengine.org";
            }
        }
        
        # Added this delay to ensure both hostfile entries gets updated, else it was skipping one of them.
        Start-Sleep -Seconds 1;
    
        if ($hostFileContent -like "*microk8s.registry*") {
            if ($hostFileContent -like "*$wslIp microk8s.registry*") {
                Write-Host "microk8s.registry host entry exists";
            }
            else {
                Write-Host "microk8s.registry host entry outdated";
                
                $EXITCODE = 1
                if ($IS_READONLY -eq $false) {
                    #Ref: https://shellgeek.com/read-file-line-by-line-in-powershell/
                    $updatedContent = [System.IO.File]::ReadAllLines($hostFilePath);
                    $linenumber = $updatedContent | select-string "microk8s.registry";
                    $updatedContent[$linenumber.LineNumber - 1] = "$wslIp microk8s.registry";
                    
                    # Added this to avoid file in user error.
                    $fileLocked = Test-FileLock -Path $hostFilePath
                    while ($fileLocked -eq $true) {
                        Write-Host "hostfile is locked. Waiting for 2 secs.";
    
                        Start-Sleep -Seconds 2;
    
                        $fileLocked = Test-FileLock -Path $hostFilePath
                    }

                    [System.IO.File]::WriteAllLines($hostFilePath, $updatedContent);
                }
            }
        }
        else {
            Write-Host "microk8s.registry host entry needs to be added";
    
            $EXITCODE = 1
            if ($IS_READONLY -eq $false) {
                Add-Content -Path $hostFilePath -value "`n$wslIp microk8s.registry";
            }
        }
    }
    else {
        Write-Host "*.etherealengine.org & microk8s.registry host entries needs to be created";
        
        $EXITCODE = 1
        if ($IS_READONLY -eq $false) {
            Set-Content $hostFilePath "`n$wslIp local.etherealengine.org api-local.etherealengine.org instanceserver-local.etherealengine.org 00000.instanceserver-local.etherealengine.org 00001.instanceserver-local.etherealengine.org 00002.instanceserver-local.etherealengine.org 00003.instanceserver-local.etherealengine.org`n$wslIp microk8s.registry";
        }
    }
    
} catch {
    Write-host "Failed in check-hostfile"
    Write-Host $_

    Write-host "Exiting in 10 seconds"
    Start-Sleep -Seconds 10;
    $EXITCODE = 2;
}

exit $EXITCODE;