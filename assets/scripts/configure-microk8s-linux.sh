#!/bin/bash

#==========
# Functions
#==========

checkExitCode() {
    exit_status=$?
    if [ $exit_status -ne 0 ]; then
        exit $exit_status
    fi
}

#===========
# Parameters
#===========

while getopts a:c:d:f:i:p:r: flag; do
    case "${flag}" in
    a) ASSETS_FOLDER=${OPTARG} ;;
    c) CONFIGS_FOLDER=${OPTARG} ;;
    d) FORCE_DB_REFRESH=${OPTARG} ;;
    f) ENGINE_FOLDER=${OPTARG} ;;
    i) CLUSTER_ID=${OPTARG} ;;
    p) PASSWORD=${OPTARG} ;;
    r) ENABLE_RIPPLE_STACK=${OPTARG} ;;
    *)
        echo "Invalid argument passed" >&2
        exit 1
        ;;
    esac
done

if [[ -z $ASSETS_FOLDER || -z $CONFIGS_FOLDER || -z $FORCE_DB_REFRESH || -z $ENGINE_FOLDER || -z $CLUSTER_ID || -z $PASSWORD || -z $ENABLE_RIPPLE_STACK ]]; then
    echo "Missing arguments"
    exit 1
fi

#======
# Login
#======

bash ./check-login.sh "$PASSWORD"

checkExitCode

set -e

#=============
# Verify Node
#=============

INSTALL_NODE=false
if node --version >/dev/null; then
    echo "node is installed"

    NODE_VERSION=$(node --version)

    # Ensure version is greater than 16
    NODE_MAJOR=${NODE_VERSION:1:2}
    if [[ $NODE_MAJOR -lt 16 ]]; then
        echo "node version is outdated $NODE_VERSION"
        INSTALL_NODE=true
    fi
else
    echo "node is not installed"
    INSTALL_NODE=true
fi

if $INSTALL_NODE; then
    # Ensure NVM is installed
    if nvm --version >/dev/null; then
        echo "nvm is installed"
    else
        echo "nvm is not installed"

        echo "$PASSWORD" | sudo -S apt update -y
        echo "$PASSWORD" | sudo -S apt install curl -y
        curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
        source ~/.profile

        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
    fi

    NVM_VERSION=$(nvm --version)
    echo "nvm version is $NVM_VERSION"

    nvm install node
    echo "node is installed"
fi

NODE_VERSION=$(node --version)
echo "node version is $NODE_VERSION"

#=============
# Verify Npm
#=============

bash ./check-npm.sh

checkExitCode

#================
# Verify Python 3
#================

bash ./check-python.sh "$PASSWORD"

#=============
# Verify Make
#=============

bash ./check-make.sh "$PASSWORD"

#=============
# Verify Git
#=============

bash ./check-git.sh "$PASSWORD"

#=============
# Get Engine
#=============

bash ./check-engine-repo.sh "$ENGINE_FOLDER"

#==============
# Verify Docker
#==============

bash ./check-docker.sh "$PASSWORD"

#======================
# Verify Docker Compose
#======================

bash ./check-docker-compose.sh "$PASSWORD"

#============================
# Ensure DB and Redis Running
#============================

bash ./check-mysql.sh "$PASSWORD" "$ENGINE_FOLDER"

#===============
# Verify Kubectl
#===============

bash ./check-kubectl.sh "$PASSWORD"

#============
# Verify Helm
#============

bash ./check-helm.sh "$PASSWORD"

#================
# Verify MicroK8s
#================

bash ./check-microk8s.sh "$PASSWORD" "$ASSETS_FOLDER"

checkExitCode

#================================
# Docker MicroK8s Registry access
#================================

if [[ -f "/etc/docker/daemon.json" ]]; then
    echo "daemon.json file exists at /etc/docker/daemon.json"
else
    if [[ ! -d "/etc/docker" ]]; then
        echo "$PASSWORD" | sudo -S mkdir "/etc/docker"
    fi

    echo "$PASSWORD" | sudo -S -- sh -c "echo '{\"insecure-registries\" : [\"localhost:32000\"]}' >>/etc/docker/daemon.json"
    echo "daemon.json file created at /etc/docker/daemon.json"

    echo "$PASSWORD" | sudo -S systemctl restart docker
fi

#================
# Verify hostfile
# Reference:
# https://stackoverflow.com/a/29082739/2077741
# https://stackoverflow.com/a/18744367/2077741
#================

ADD_DOMAIN=false
if grep -q "local.etherealengine.com" /etc/hosts; then
    if grep -q "127.0.0.1 local.etherealengine.com" /etc/hosts; then
        echo "*.etherealengine.com entries exists"
    else
        echo "*.etherealengine.com entries outdated"
        grep -v 'local.etherealengine.com' /etc/hosts >/tmp/hosts.tmp
        echo "$PASSWORD" | sudo -S cp /tmp/hosts.tmp /etc/hosts
        ADD_DOMAIN=true
    fi
else
    ADD_DOMAIN=true
fi

if $ADD_DOMAIN; then
    echo "$PASSWORD" | sudo -S -- sh -c "echo '127.0.0.1 local.etherealengine.com api-local.etherealengine.com instanceserver-local.etherealengine.com 00000.instanceserver-local.etherealengine.com 00001.instanceserver-local.etherealengine.com 00002.instanceserver-local.etherealengine.com 00003.instanceserver-local.etherealengine.com' >>/etc/hosts"
    echo "*.etherealengine.com entries added"
fi

#==================
# Verify Helm Repos
#==================

bash ./check-helm-repos.sh

#======================
# Verify agones & redis
#======================

bash ./check-agones-redis.sh "$ENGINE_FOLDER"

#====================
# Verify ripple stack
#====================

bash ./check-ripple.sh "$ENABLE_RIPPLE_STACK" "$ENGINE_FOLDER" "$CONFIGS_FOLDER" "$CLUSTER_ID"

#=======================
# Verify Ethereal Engine
#=======================

bash ./check-engine-deployment.sh "$ENGINE_FOLDER" "$FORCE_DB_REFRESH" "$CONFIGS_FOLDER" "$CLUSTER_ID" "microk8s"

echo "All Done"

exit 0
