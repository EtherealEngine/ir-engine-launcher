
#==================================
# Enable localhostForwarding in WSL
#==================================

$wslConfigPath = "$env:UserProfile\.wslconfig"

if (Test-Path $wslConfigPath) {
    $wslConfigContent = Get-Content $wslConfigPath -Raw

    if ($wslConfigContent -like "*[wsl2]*") {
        if ($wslConfigContent -like "*localhostForwarding=true*") {
            Write-Host "$wslConfigPath with localhostForwarding entry exists"
        } else {
            $updatedContent = $wslConfigContent -replace "localhostForwarding=false", ""
            $updatedContent = $updatedContent -replace "\[wsl2\]", "[wsl2]`nlocalhostForwarding=true"
            Set-Content $wslConfigPath $updatedContent
            Write-Host "$wslConfigPath with localhostForwarding entry updated"
            exit 1;
        }
    } else {
        Add-Content -Path $wslConfigPath -value "[wsl2]`nlocalhostForwarding=true"
        Write-Host "$wslConfigPath with localhostForwarding entry added"
        exit 1;
    }
}
else {
    Set-Content $wslConfigPath "[wsl2]`nlocalhostForwarding=true"
    Write-Host "$wslConfigPath with localhostForwarding entry created"
    exit 1;
}
