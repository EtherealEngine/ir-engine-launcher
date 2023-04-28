#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1
ENGINE_FOLDER=$2

#============================
# Ensure DB and Redis Running
#============================

if docker top etherealengine_minikube_db; then
    echo "mysql is running"
else
    echo "mysql is not running"

    cd "$ENGINE_FOLDER" || exit
    echo "$PASSWORD" | sudo -S chmod 666 /var/run/docker.sock
    npm run dev-docker
fi