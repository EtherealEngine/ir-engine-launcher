#!/bin/bash

#===========
# Parameters
#===========

PASSWORD=$1

#=============
# Verify Git
#=============

if git --version >/dev/null; then
    echo "git is installed"
else
    echo "git is not installed"

    echo "$PASSWORD" | sudo -S apt-get update -y
    echo "$PASSWORD" | sudo -S apt-get install -y git
fi

GIT_VERSION=$(git --version)
echo "git version is $GIT_VERSION"