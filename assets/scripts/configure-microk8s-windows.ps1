
Write-Host "There are a total of $($args.count) arguments"
for ( $i = 0; $i -lt $args.count; $i++ ) {
    Write-Host "Argument  $i is $($args[$i])"
}

Write-Host "Hello"


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