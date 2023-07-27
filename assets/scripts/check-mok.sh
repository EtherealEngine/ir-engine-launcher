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

createMokFiles() {
    username=$1
    cd /var/lib/shim-signed/mok/
    sudo openssl req -new -x509 -newkey rsa:2048 -keyout MOK.priv -outform DER -out MOK.der -days 36500 -subj "/CN=My Name/"
    openssl x509 -inform der -in MOK.der -out MOK.pem
    exit 0
}

enrollMok() {

    echo -e "Please first enter your account password. Then enter new password for MOK Manager.\n This password will be used after reboot, during the enrollment of MOK."

    sudo mokutil --import /var/lib/shim-signed/mok/MOK.der

    echo -e "Now the system needs to restart. After booting, you will be presented\n with the MOK Manager. In MOK Manager select 'Enroll MOK' and continue.\n
    Enter the password you just entered when asked by the MOK Manager.\n After the process is complete, click 'Reboot'.\n
    After booting run Ethereal Engine Control Center."
    read -p "Do you want to restart the system? (y/n) " yn

    case $yn in 
        y ) echo Restarting...;;
        n ) echo Exiting...;
            exit 1;;
        * ) echo invalid response;
            exit 1;;
    esac

    echo "$password" | sudo -S systemctl reboot
    exit 0
}

export -f enrollMok
export -f createMokFiles

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
            echo "creating mok files"
            echo "$PASSWORD" | sudo -S mkdir -p /var/lib/shim-signed/mok/
            gnome-terminal --wait -- bash -c "createMokFiles $USERNAME;exec bash"
        fi
        echo "gnommee"
        gnome-terminal --wait -- bash -c "enrollMok;exec bash"

    fi
fi        