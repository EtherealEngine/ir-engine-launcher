
#==========
# Ref: https://stackoverflow.com/a/73285729
#==========

#========================
# Verify Git installation
#========================

$IS_GIT_INSTALLED = $false;

$gitVersion = Invoke-Expression "& git --version"

if ($gitVersion) {
    Write-Host "git for windows is installed";
    $IS_GIT_INSTALLED = $true;
}
else {
    Write-Host "git for windows is not installed";
    $IS_GIT_INSTALLED = $false;
}

#=======================
# Install Git
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

    Start-Process powershell -PassThru -WindowStyle hidden -Wait -verb runas -ArgumentList " -file $PSScriptRoot\setup-git-windows.ps1 '$exePath'"

    Write-Host "git for windows successfully installed";

    $gitVersion = Invoke-Expression "& git --version"
}

Write-Host "git for windows version is $gitVersion";

exit 0;