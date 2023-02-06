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

./check-login.sh "$PASSWORD"

checkExitCode

set -e

#=============
# Verify Node
#=============

./check-node.sh "$PASSWORD"

#=============
# Verify Npm
#=============

./check-npm.sh

checkExitCode

#================
# Verify Python 3
#================

./check-python.sh "$PASSWORD"

#=============
# Verify Make
#=============

./check-make.sh "$PASSWORD"

#=============
# Verify Git
#=============

./check-git.sh "$PASSWORD"

#=============
# Get Engine
#=============

./check-engine-repo.sh "$ENGINE_FOLDER"

#==============
# Verify Docker
#==============

./check-docker.sh "$PASSWORD"

#======================
# Verify Docker Compose
#======================

./check-docker-compose.sh "$PASSWORD"

#============================
# Ensure DB and Redis Running
#============================

./check-mysql.sh "$PASSWORD"

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

./check-kubectl.sh "$PASSWORD"

#============
# Verify Helm
#============

./check-helm.sh "$PASSWORD"

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
    minikube start --disk-size 30000m --cpus 4 --memory 10124m --addons ingress metrics-server --driver virtualbox
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
if grep -q "local.etherealengine.com" /etc/hosts; then
    if grep -q "$MINIKUBE_IP" /etc/hosts; then
        echo "*.etherealengine.com entries exists"
    else
        echo "*.etherealengine.com entries outdated"
        grep -v 'local.etherealengine.com' /etc/hosts >/tmp/hosts.tmp
        echo "$PASSWORD" | sudo -S cp /tmp/hosts.tmp /etc/hosts
        ADD_MINIKUBE_IP=true
    fi
else
    ADD_MINIKUBE_IP=true
fi

if $ADD_MINIKUBE_IP; then
    echo "$PASSWORD" | sudo -S -- sh -c "echo '$MINIKUBE_IP local.etherealengine.com api-local.etherealengine.com instanceserver-local.etherealengine.com 00000.instanceserver-local.etherealengine.com 00001.instanceserver-local.etherealengine.com 00002.instanceserver-local.etherealengine.com 00003.instanceserver-local.etherealengine.com' >>/etc/hosts"
    echo "*.etherealengine.com entries added"
fi

#==================
# Verify Helm Repos
#==================

./check-helm-repos.sh

#======================
# Verify agones & redis
#======================

./check-agones-redis.sh "$ENGINE_FOLDER"

#====================
# Verify ripple stack
#====================

./check-ripple.sh "$ENABLE_RIPPLE_STACK" "$ENGINE_FOLDER"

#=======================
# Verify Ethereal Engine
#=======================

./check-engine-deployment.sh "$ENGINE_FOLDER" "$FORCE_DB_REFRESH" "$CONFIGS_FOLDER" "$CLUSTER_ID" "minikube"

exit 0
