#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1

#=============
# Verify Make
#=============

if make --version >/dev/null; then
    echo "make is installed"
else
    echo "make is not installed"

    echo "$PASSWORD" | sudo -S apt-get update -y
    echo "$PASSWORD" | sudo -S apt-get install -y build-essential
fi

MAKE_VERSION=$(make --version)
echo "make version is $MAKE_VERSION"