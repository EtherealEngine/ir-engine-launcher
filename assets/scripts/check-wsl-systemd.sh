#!/bin/bash

#===========
# Parameters
#===========

PASSWORD=$1

#======================
# Enable systemd in WSL
#======================

ADD_SYSTEMD=false
if grep -q "[boot]" /etc/wsl.conf; then
    if grep -q "systemd=true" /etc/wsl.conf; then
        echo "/etc/wsl.conf systemd entry exists"
    else
        echo "/etc/wsl.conf systemd entry outdated"
        grep -v '[boot]' /etc/wsl.conf >/tmp/wsl1.tmp
        grep -v 'systemd' /tmp/wsl1.tmp >/tmp/wsl2.tmp
        echo "$PASSWORD" | sudo -S cp /tmp/wsl2.tmp /etc/wsl.conf
        ADD_SYSTEMD=true
    fi
else
    ADD_SYSTEMD=true
fi

if $ADD_SYSTEMD; then
    echo "$PASSWORD" | sudo -S -- sh -c "echo '[boot]\nsystemd=true' >>/etc/wsl.conf"
    echo "/etc/wsl.conf systemd entry added"
    exit 1
fi
