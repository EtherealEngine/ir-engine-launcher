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

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion

if docker top xrengine_minikube_db; then
    echo "mysql is running"
else
    echo "mysql is not running"

    cd "$ENGINE_FOLDER" || exit
    echo "$PASSWORD" | sudo -S chmod 666 /var/run/docker.sock
    npm run dev-docker
fi