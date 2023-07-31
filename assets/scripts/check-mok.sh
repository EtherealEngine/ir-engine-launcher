#!/bin/bash

set -e

#===========
# Parameters
#===========

while getopts o:p: flag; do
    case "${flag}" in
    o) PERMISSION=${OPTARG} ;;
    p) PASSWORD=${OPTARG} ;;
    *)
        echo "Invalid argument passed" >&2
        exit 1
        ;;
    esac
done

if [[  -z $PERMISSION || -z $PASSWORD ]]; then
    echo "Missing arguments"
    exit 1
fi

#==========
# Functions
#==========

enrollMok() {
    password=$1

    sudo dpkg --configure -a

    echo "$password" | sudo -S systemctl reboot
    exit 0
}

export -f enrollMok

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
    else
        if $PERMISSION -eq 'yes'; then
            gnome-terminal --wait -- bash -c "enrollMok $PASSWORD;exec bash"
            exit 0
        elif $PERMISSION -eq 'none'; then 
            exit 2
        else
            exit 1
        fi
    fi
fi