#!/bin/bash

#===========
# Parameters
#===========

PASSWORD=$1

#======
# Login
#======

LOGIN=$(echo "$PASSWORD" | sudo -S echo "User logged in")
if [[ $LOGIN == *"User logged in"* ]]; then
    exit 0
else
    exit 1
fi
