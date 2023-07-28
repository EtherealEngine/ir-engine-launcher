#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1

#==========
# Functions
#==========

enrollMok() {
    password=$1

    sudo dpkg --configure -a
    
    echo -e "\n\n\n"
    echo -e "The system needs to restart. After booting, you will be presented\n with the MOK Manager. In MOK Manager select 'Enroll MOK' and continue.\n
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
        gnome-terminal --wait -- bash -c "enrollMok $PASSWORD;exec bash"

    fi
fi