#!/bin/bash

set -e

#===========
# Parameters
#===========

while getopts o:p: flag; do
    case "${flag}" in
    p) PASSWORD=${OPTARG} ;;
    *)
        echo "Invalid argument passed" >&2
        exit 1
        ;;
    esac
done

if [[  -z $PASSWORD ]]; then
    echo "Missing arguments"
    exit 1
fi

#===========
# Verify MOK
#===========

if mokutil --version 2>/dev/null | grep -q 'command not found'; then
    echo "mokutil is not installed"
    echo $(mokutil --version)

    echo "$PASSWORD" | sudo -S apt-get update -y
    echo "$PASSWORD" | sudo -S apt-get install -y mokutil
else
    echo "mokutil is installed"
fi

if echo "$PASSWORD" | sudo -S mokutil --sb-state | grep -q 'SecureBoot enabled'; then
    if echo "$PASSWORD" | sudo -S mokutil --list-enrolled | grep -q 'Secure Boot Module Signature key'; then
        echo "mok is enrolled"
        exit 0
    else
        #Exit code 2 indicates permission is needed
        exit 2
    fi
fi