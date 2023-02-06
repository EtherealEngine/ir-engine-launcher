#!/bin/bash

#===========
# Parameters
#===========

PASSWORD=$1

#============================
# Ensure DB and Redis Running
#============================

if docker top xrengine_minikube_db; then
    echo "mysql is running"
else
    echo "mysql is not running"

    echo "$PASSWORD" | sudo -S chmod 666 /var/run/docker.sock
    npm run dev-docker
fi