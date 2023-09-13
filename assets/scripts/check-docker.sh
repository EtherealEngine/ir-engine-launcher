#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1

#==============
# Verify Docker
#==============

if docker --version >/dev/null; then
    echo "docker is installed"
else
    echo "docker is not installed"

    curl -fsSL https://get.docker.com -o get-docker.sh
    echo "$PASSWORD" | sudo -S sh get-docker.sh
    rm ./get-docker.sh -f

    echo "$PASSWORD" | sudo -S usermod -aG docker $USER
fi

DOCKER_VERSION=$(docker --version)
echo "docker version is $DOCKER_VERSION"