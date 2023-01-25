
Write-Output "There are a total of $($args.count) arguments"
for ( $i = 0; $i -lt $args.count; $i++ ) {
    Write-Output "Argument  $i is $($args[$i])"
}

Write-Output "Hello"
Write-Output "Hello again"