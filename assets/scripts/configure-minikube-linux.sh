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

while getopts a:c:d:f:i:o:p:r:t: flag; do
    case "${flag}" in
    a) ASSETS_FOLDER=${OPTARG} ;;
    c) CONFIGS_FOLDER=${OPTARG} ;;
    d) FORCE_DB_REFRESH=${OPTARG} ;;
    f) ENGINE_FOLDER=${OPTARG} ;;
    i) CLUSTER_ID=${OPTARG} ;;
    o) OPS_FOLDER=${OPTARG} ;;
    p) PASSWORD=${OPTARG} ;;
    r) ENABLE_RIPPLE_STACK=${OPTARG} ;;
    t) TEST=${OPTARG} ;;
    *)
        echo "Invalid argument passed" >&2
        exit 1
        ;;
    esac
done

if [[ -z $ASSETS_FOLDER || -z $CONFIGS_FOLDER || -z $FORCE_DB_REFRESH || -z $ENGINE_FOLDER || -z $CLUSTER_ID || -z $OPS_FOLDER || -z $ENABLE_RIPPLE_STACK ]]; then
    # Allow empty passwords
    echo "Missing arguments"
    exit 1
fi

#================================
# Set script directory as current
# Ref: https://stackoverflow.com/a/64168461/2077741
#================================

SCRIPTS_FOLDER="$(dirname "${BASH_SOURCE[0]}")"

#======
# Login
#======

bash "$SCRIPTS_FOLDER/check-login.sh" "$PASSWORD"

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

bash "$SCRIPTS_FOLDER/check-npm.sh"

checkExitCode

#================
# Verify Python 3
#================

bash "$SCRIPTS_FOLDER/check-python.sh" "$PASSWORD"

checkExitCode

#=============
# Verify Make
#=============

bash "$SCRIPTS_FOLDER/check-make.sh" "$PASSWORD"

checkExitCode

#=============
# Verify Git
#=============

bash "$SCRIPTS_FOLDER/check-git.sh" "$PASSWORD"

checkExitCode

#=============
# Get Engine
#=============

bash "$SCRIPTS_FOLDER/check-engine-repo.sh" "$ENGINE_FOLDER" "$OPS_FOLDER"

checkExitCode

#==============
# Verify Docker
#==============

bash "$SCRIPTS_FOLDER/check-docker.sh" "$PASSWORD"

checkExitCode

#======================
# Verify Docker Compose
#======================

bash "$SCRIPTS_FOLDER/check-docker-compose.sh" "$PASSWORD"

checkExitCode

#============================
# Ensure DB and Redis Running
#============================

bash "$SCRIPTS_FOLDER/check-mysql.sh" "$PASSWORD" "$ENGINE_FOLDER"

checkExitCode

#=======================
# Verify VirtualBox dkms
#=======================

if virtualbox-dkms --version >/dev/null; then
    echo "virtualbox-dkms is installed"
else
    echo "virtualbox-dkms is not installed"

    echo "$PASSWORD" | sudo -S apt update -y
    echo "$PASSWORD" | sudo -S sudo apt-get install -y virtualbox-dkms
fi

#==================
# Verify VirtualBox
#==================

if vboxmanage --version >/dev/null; then
    echo "virtualbox is installed"
else
    echo "virtualbox is not installed"

    echo "$PASSWORD" | sudo -S apt update -y
    echo "$PASSWORD" | sudo -S apt install -y virtualbox
fi

VIRTUALBOX_VERSION=$(vboxmanage --version)
echo "vboxmanage version is $VIRTUALBOX_VERSION"

#===============
# Verify Kubectl
#===============

bash "$SCRIPTS_FOLDER/check-kubectl.sh" "$PASSWORD"

checkExitCode

#============
# Verify Helm
#============

bash "$SCRIPTS_FOLDER/check-helm.sh" "$PASSWORD"

checkExitCode

#================
# Verify Minikube
#================

if minikube version >/dev/null; then
    echo "minikube is installed"
else
    echo "minikube is not installed"

    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    echo "$PASSWORD" | sudo -S install minikube-linux-amd64 /usr/local/bin/minikube
fi

MINIKUBE_VERSION=$(minikube version)
echo "minikube version is $MINIKUBE_VERSION"

# Since minikube status can return a non-zero result here
set +e
MINIKUBE_STATUS=$(minikube status --output json)
set -e
if [[ $MINIKUBE_STATUS == *"minikube start"* ]] || [[ $MINIKUBE_STATUS == *"Nonexistent"* ]]; then
    if [[ "$TEST" == "true" ]]; then
        minikube start --disk-size 9000m --cpus 2 --memory max --addons ingress metrics-server --driver virtualbox
    else
        minikube start --disk-size 30000m --cpus 4 --memory 10124m --addons ingress metrics-server --driver virtualbox
    fi
elif [[ $MINIKUBE_STATUS == *"Stopped"* ]]; then
    minikube start
fi

MINIKUBE_STATUS=$(minikube status)
echo "minikube status is $MINIKUBE_STATUS"

kubectl config use-context minikube

#================
# Verify hostfile
# Reference:
# https://stackoverflow.com/a/29082739/2077741
# https://stackoverflow.com/a/18744367/2077741
#================

if grep -q "host.minikube.internal" /etc/hosts; then
    echo "host.minikube.internal entry exists"
else
    echo "$PASSWORD" | sudo -S -- sh -c "echo '10.0.2.2 host.minikube.internal' >>/etc/hosts"
    echo "host.minikube.internal entries added"
fi

MINIKUBE_IP=$(minikube ip)
ADD_MINIKUBE_IP=false
if grep -q "local.etherealengine.org" /etc/hosts; then
    if grep -q "$MINIKUBE_IP" /etc/hosts; then
        echo "*.etherealengine.org entries exists"
    else
        echo "*.etherealengine.org entries outdated"
        grep -v 'local.etherealengine.org' /etc/hosts >/tmp/hosts.tmp
        echo "$PASSWORD" | sudo -S cp /tmp/hosts.tmp /etc/hosts
        ADD_MINIKUBE_IP=true
    fi
else
    ADD_MINIKUBE_IP=true
fi

if $ADD_MINIKUBE_IP; then
    echo "$PASSWORD" | sudo -S -- sh -c "echo '$MINIKUBE_IP local.etherealengine.org api-local.etherealengine.org instanceserver-local.etherealengine.org 00000.instanceserver-local.etherealengine.org 00001.instanceserver-local.etherealengine.org 00002.instanceserver-local.etherealengine.org 00003.instanceserver-local.etherealengine.org' >>/etc/hosts"
    echo "*.etherealengine.org entries added"
fi

#==================
# Verify Helm Repos
#==================

bash "$SCRIPTS_FOLDER/check-helm-repos.sh"

checkExitCode

#======================
# Verify agones & redis
#======================

bash "$SCRIPTS_FOLDER/check-agones-redis.sh" "$OPS_FOLDER"

checkExitCode

#====================
# Verify ripple stack
#====================

bash "$SCRIPTS_FOLDER/check-ripple.sh" "$ENABLE_RIPPLE_STACK" "$OPS_FOLDER" "$CONFIGS_FOLDER" "$CLUSTER_ID"

checkExitCode

#=======================
# Verify Ethereal Engine
#=======================

bash "$SCRIPTS_FOLDER/check-engine-deployment.sh" "$ENGINE_FOLDER" "$FORCE_DB_REFRESH" "$CONFIGS_FOLDER" "$CLUSTER_ID" "minikube" "$OPS_FOLDER" "latest"

checkExitCode

echo "All Done"

exit 0
