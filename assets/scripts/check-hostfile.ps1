
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

$hostFilePath = "$env:windir\System32\drivers\etc\hosts";
$wslIp = wsl hostname -I;
if ($wslIp -like "* *") {
    $wslIp = $wslIp.split(" ")[0]
}

if (Test-Path $hostFilePath) {
    # Added round brackets around get-content to fix file is in user issue.
    #Ref: https://stackoverflow.com/a/10480811
    $hostFileContent = (Get-Content $hostFilePath -Raw);

    if ($hostFileContent -like "*local.etherealengine.com*") {
        if ($hostFileContent -like "*$wslIp local.etherealengine.com*") {
            Write-Host "*.etherealengine.com host entry exists";
        }
        else {
            Write-Host "*.etherealengine.com host entry outdated";

            $EXITCODE = 1
            if ($IS_READONLY -eq $false) {
                # Added round brackets around get-content to fix file is in user issue.
                #Ref: https://stackoverflow.com/a/10480811
                $updatedContent = (Get-Content $hostFilePath);
                $linenumber = $updatedContent | select-string "local.etherealengine.com";
                $updatedContent[$linenumber.LineNumber - 1] = "$wslIp local.etherealengine.com api-local.etherealengine.com instanceserver-local.etherealengine.com 00000.instanceserver-local.etherealengine.com 00001.instanceserver-local.etherealengine.com 00002.instanceserver-local.etherealengine.com 00003.instanceserver-local.etherealengine.com";
                Set-Content $hostFilePath $updatedContent;
            }
        }
    }
    else {
        Write-Host "*.etherealengine.com host entry needs to be added";

        $EXITCODE = 1
        if ($IS_READONLY -eq $false) {
            Add-Content -Path $hostFilePath -value "`n$wslIp local.etherealengine.com api-local.etherealengine.com instanceserver-local.etherealengine.com 00000.instanceserver-local.etherealengine.com 00001.instanceserver-local.etherealengine.com 00002.instanceserver-local.etherealengine.com 00003.instanceserver-local.etherealengine.com";
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
                # Added round brackets around get-content to fix file is in user issue.
                #Ref: https://stackoverflow.com/a/10480811
                $updatedContent = (Get-Content $hostFilePath);
                $linenumber = $updatedContent | select-string "microk8s.registry";
                $updatedContent[$linenumber.LineNumber - 1] = "$wslIp microk8s.registry";
                Set-Content $hostFilePath $updatedContent;
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
    Write-Host "*.etherealengine.com & microk8s.registry host entries needs to be created";
    
    $EXITCODE = 1
    if ($IS_READONLY -eq $false) {
        Set-Content $hostFilePath "`n$wslIp local.etherealengine.com api-local.etherealengine.com instanceserver-local.etherealengine.com 00000.instanceserver-local.etherealengine.com 00001.instanceserver-local.etherealengine.com 00002.instanceserver-local.etherealengine.com 00003.instanceserver-local.etherealengine.com`n$wslIp microk8s.registry";
    }
}

exit $EXITCODE;
