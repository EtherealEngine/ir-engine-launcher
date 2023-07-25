
#=======================
# Setup Git
#=======================

$exePath = $args[0]

Write-Host "installing git for windows";
# Execute git installer
Start-Process $exePath -ArgumentList '/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh"' -Wait

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

exit 0;