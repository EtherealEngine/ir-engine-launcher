#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1

#===========
# Enroll MOK
#===========

echo "Please enter password. This password will be used after reboot, during the enrollment of MOK."

echo "$PASSWORD" | sudo -S sudo mokutil --import /var/lib/shim-signed/mok/MOK.der

echo "Now the system needs to restart. After booting, you will be presented with the MOK Manager. In MOK Manager select 'Enroll MOK key' and continue.\n
Enter the password you just entered when asked by the MOK Manager. After the process is complete, click 'Reboot'.\n
After booting run Ethereal Engine Control Center.\n
\n
Do you want to restart the system?[y/n]"

read restart

if [ "$restart" == "y" ]; then
    echo "$PASSWORD" | sudo -S systemctl reboot
else
    echo "The system needs to be restarted to proceed."
    exit 1
fi




