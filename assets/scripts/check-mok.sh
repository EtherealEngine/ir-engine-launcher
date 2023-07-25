#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1
SCRIPTS_FOLDER=$2

#==========
# Functions
#==========

checkExitCode() {
    exit_status=$?
    if [ $exit_status -ne 0 ]; then
        exit $exit_status
    fi
}

#===========
# Verify MOK
#===========
echo "hello 1"
if mokutil --version >/dev/null; then
    echo "mokutil is installed"
    echo "hello 2"
else
    echo "mokutil is not installed"
    echo $(mokutil --version)

    echo "$PASSWORD" | sudo -S apt-get update -y
    echo "$PASSWORD" | sudo -S apt-get install -y mokutil
fi

if echo "$PASSWORD" | sudo -S mokutil --sb-state | grep -q 'SecureBoot enabled'; then
    echo "hello 3"
    if echo "$PASSWORD" | sudo -S mokutil --list-enrolled | grep -q 'Secure Boot Module Signature key'; then
        echo "mok is enrolled"
    else
        if [ -f /var/lib/shim-signed/mok/MOK.der ]; then
            echo "mok exists"
        else
            echo "hello 4"
            echo "$PASSWORD" | sudo -S mkdir -p /var/lib/shim-signed/mok/
            cd /var/lib/shim-signed/mok/
            echo "$PASSWORD" | sudo -S openssl req -new -x509 -newkey rsa:2048 -keyout MOK.priv -outform DER -out MOK.der -days 36500 -subj "/CN=My Name/"
            echo "$PASSWORD" | sudo -S openssl x509 -inform der -in MOK.der -out MOK.pem
        fi
        echo "gnommee"
        bash "$SCRIPTS_FOLDER/enroll-mok.sh" "$PASSWORD"

        checkExitCode

    fi
fi        