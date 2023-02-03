
#=======================
# Update system hostfile
#=======================

$hostFilePath = "$env:UserProfile\System32\drivers\etc\hosts"
$wslIps = wsl hostname -I

if (Test-Path $hostFilePath) {
    $hostFileContent = Get-Content $hostFilePath -Raw

    if ($hostFileContent -like "*[wsl2]*") {
        if ($hostFileContent -like "*localhostForwarding=true*") {
            Write-Host "$hostFilePath with localhostForwarding entry exists"
        } else {
            $updatedContent = $hostFileContent -replace "localhostForwarding=false", ""
            $updatedContent = $updatedContent -replace "\[wsl2\]", "[wsl2]`nlocalhostForwarding=true"
            Set-Content $hostFilePath $updatedContent
            Write-Host "$hostFilePath with localhostForwarding entry updated"
            exit 1;
        }
    } else {
        Add-Content -Path $hostFilePath -value "[wsl2]`nlocalhostForwarding=true"
        Write-Host "$hostFilePath with localhostForwarding entry added"
        exit 1;
    }
}
else {
    Set-Content $hostFilePath "[wsl2]`nlocalhostForwarding=true"
    Write-Host "$hostFilePath with etherealengine entries created"
    exit 1;
}
