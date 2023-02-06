#!/bin/bash

#===========
# Parameters
#===========

PASSWORD=$1

#================
# Verify Python 3
#================

if pip3 --version >/dev/null; then
    echo "python is installed"
else
    echo "python is not installed"

    echo "$PASSWORD" | sudo -S apt-get update -y
    echo "$PASSWORD" | sudo -S apt-get install -y python3-pip
fi

PYTHON_VERSION=$(python3 --version)
echo "python version is $PYTHON_VERSION"