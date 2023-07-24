
#==========
# Ref: https://stackoverflow.com/a/73285729
#==========


#========================
# Verify Git installation
#========================

$IS_GIT_INSTALLED = $false;

$gitVersion = & "git --version"

if ($gitVersion) {
    Write-Host "git for windows is installed";
    $IS_GIT_INSTALLED = $true;
}
else {
    Write-Host "git for windows is not installed";
    $IS_GIT_INSTALLED = $false;
}

#=======================
# Installing Git
#=======================

if ($IS_GIT_INSTALLED -eq $false) {
    $exePath = "$env:TEMP\git.exe"

    # Reference: https://copdips.com/2019/12/Using-Powershell-to-retrieve-latest-package-url-from-github-releases.html
    $url = 'https://github.com/git-for-windows/git/releases/latest'
    $request = [System.Net.WebRequest]::Create($url)
    $response = $request.GetResponse()
    $realTagUrl = $response.ResponseUri.OriginalString
    $version = $realTagUrl.split('/')[-1].Trim('v')
    $downloadUrl = $realTagUrl.Replace('tag', 'download') + '/Git-' + $version.Replace('.windows', '') + '-64-bit.exe'

    # Download git installer
    Write-Host "downloading git for windows using url: $downloadUrl"
    Invoke-WebRequest -Uri $downloadUrl -UseBasicParsing -OutFile $exePath

    # Execute git installer
    Start-Process $exePath -verb runas -ArgumentList '/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh"' -Wait

    # Optional: For bash.exe, add '$env:PROGRAMFILES\Git\bin' to PATH
    [Environment]::SetEnvironmentVariable('Path', "$([Environment]::GetEnvironmentVariable('Path', 'Machine'));$env:PROGRAMFILES\Git\bin", 'Machine')

    # Make new environment variables available in the current PowerShell session:
    foreach ($level in "Machine", "User") {
        [Environment]::GetEnvironmentVariables($level).GetEnumerator() | ForEach-Object {
            # For Path variables, append the new values, if they're not already in there
            if ($_.Name -match 'Path$') { 
                $_.Value = ($((Get-Content "Env:$($_.Name)") + ";$($_.Value)") -split ';' | Select-Object -unique) -join ';'
            }
            $_
        } | Set-Content -Path { "Env:$($_.Name)" }
    }

    $gitVersion = & "git --version"
}

Write-Host "git for windows version is $gitVersion";

exit 0;