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
    echo "logged in"
    exit 0
else
    echo "not logged in"
    exit 1
fi
