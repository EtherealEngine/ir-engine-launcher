#!/bin/bash

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

        sudo apt install curl
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

if npm --version >/dev/null; then
    echo "npm is installed"

    NPM_VERSION=$(npm --version)
    echo "npm version is $NPM_VERSION"
else
    echo "npm is not installed"
    exit 1
fi

#================
# Verify Python 3
#================

if python3 --version >/dev/null; then
    echo "python is installed"
else
    echo "python is not installed"

    sudo apt-get update -y
    sudo apt-get install -y python3-pip
fi

PYTHON_VERSION=$(python3 --version)
echo "python version is $PYTHON_VERSION"

#=============
# Verify Make
#=============

if make --version >/dev/null; then
    echo "make is installed"
else
    echo "make is not installed"

    sudo apt-get update -y
    sudo apt-get install -y build-essential
fi

MAKE_VERSION=$(make --version)
echo "make version is $MAKE_VERSION"

#=============
# Verify Git
#=============

if git --version >/dev/null; then
    echo "git is installed"
else
    echo "git is not installed"

    sudo apt-get update -y
    sudo apt-get install -y git
fi

GIT_VERSION=$(git --version)
echo "git version is $GIT_VERSION"

#=============
# Get XREngine
#=============

XRENGINE_PATH=~/xrengine

if [[ -d $XRENGINE_PATH ]] && [[ -f "$XRENGINE_PATH/package.json" ]]; then
    echo "xrengine repo exists at $XRENGINE_PATH"
else
    echo "cloning xrengine in $XRENGINE_PATH"
    git clone https://github.com/XRFoundation/XREngine $XRENGINE_PATH
fi

cd $XRENGINE_PATH
npm install

#==============
# Verify Docker
#==============

if docker --version >/dev/null; then
    echo "docker is installed"
else
    echo "docker is not installed"

    # sudo apt-get remove -y docker docker-engine docker.io containerd runc
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
fi

DOCKER_VERSION=$(docker --version)
echo "docker version is $DOCKER_VERSION"

#======================
# Verify Docker Compose
#======================

if docker-compose --version >/dev/null; then
    echo "docker-compose is installed"
else
    echo "docker-compose is not installed"

    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

DOCKER_COMPOSE_VERSION=$(docker-compose --version)
echo "docker-compose version is $DOCKER_COMPOSE_VERSION"

#============================
# Ensure DB and Redis Running
#============================

if docker ps -q -f status=running -f name=^/xrengine_minikube_db$; then
    echo "mysql is running"
else
    echo "mysql is running"

    npm run dev-docker
fi

#==================
# Verify VirtualBox
#==================

if vboxmanage --version >/dev/null; then
    echo "virtualbox is installed"
else
    echo "virtualbox is not installed"

    sudo apt-get update -y
    sudo apt-get install -y virtualbox-6.1
fi

VIRTUALBOX_VERSION=$(vboxmanage --version)
echo "vboxmanage version is $VIRTUALBOX_VERSION"

#===============
# Verify Kubectl
#===============

if kubectl version --client >/dev/null; then
    echo "kubectl is installed"
else
    echo "kubectl is not installed"

    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
fi

KUBECTL_VERSION=$(kubectl version --client)
echo "kubectl version is $KUBECTL_VERSION"

#============
# Verify Helm
#============

if helm version >/dev/null; then
    echo "helm is installed"
else
    echo "helm is not installed"

    curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
    sudo apt-get install -y apt-transport-https
    echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
    sudo apt-get update -y
    sudo apt-get install -y helm
fi

HELM_VERSION=$(helm version)
echo "helm version is $HELM_VERSION"

#================
# Verify Minikube
#================

if minikube version >/dev/null; then
    echo "minikube is installed"
else
    echo "minikube is not installed"

    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
    minikube start --disk-size 40000m --cpus 4 --memory 10124m --addons ingress --driver virtualbox
fi

MINIKUBE_VERSION=$(minikube version)
echo "minikube version is $MINIKUBE_VERSION"

MINIKUBE_STATUS=$(minikube status --output json)
if [[ $MINIKUBE_STATUS == *"Stopped"* ]]; then
    minikube start
fi

MINIKUBE_STATUS=$(minikube status --output json)
echo "minikube status is $MINIKUBE_STATUS"

#================
# Verify hostfile
# Reference:
# https://stackoverflow.com/a/29082739/2077741
# https://stackoverflow.com/a/18744367/2077741
#================

if grep -q "host.minikube.internal" /etc/hosts; then
    echo "host.minikube.internal entry exists"
else
    echo "10.0.2.2 host.minikube.internal" >>/etc/hosts
    echo "host.minikube.internal entries added"
fi

MINIKUBE_IP=$(minikube ip)
ADD_MINIKUBE_IP=false
if grep -q "local.theoverlay.io" /etc/hosts; then

    if grep -q "$MINIKUBE_IP" /etc/hosts; then
        echo "*.theoverlay.io entries exists"
    else
        grep -v 'local.theoverlay.io' /etc/hosts >/tmp/hosts.tmp
        cp /tmp/hosts.tmp /etc/hosts
        ADD_MINIKUBE_IP=true
        echo "*.theoverlay.io entries outdated"
    fi
else
    echo " local.theoverlay.io api-local.theoverlay.io gameserver-local.theoverlay.io 00000.gameserver-local.theoverlay.io 00001.gameserver-local.theoverlay.io 00002.gameserver-local.theoverlay.io" >>/etc/hosts
    ADD_MINIKUBE_IP=true
fi

if $ADD_MINIKUBE_IP; then
    echo "$MINIKUBE_IP local.theoverlay.io api-local.theoverlay.io gameserver-local.theoverlay.io 00000.gameserver-local.theoverlay.io 00001.gameserver-local.theoverlay.io 00002.gameserver-local.theoverlay.io" >>/etc/hosts
    echo "*.theoverlay.io entries added"
fi

#==================
# Verify Helm Repos
#==================

helm repo add agones https://agones.dev/chart/stable
helm repo add redis https://charts.bitnami.com/bitnami
helm repo add xrengine https://helm.xrengine.io

helm repo update

echo "helm repos added and updated"

#======================
# Verify agones & redis
#======================

kubectl config use-context minikube

if helm status agones >/dev/null; then
    echo "agones is installed"
else
    echo "agones is not installed"

    helm install -f packages/ops/configs/agones-default-values.yaml agones agones/agones
    sleep 20
fi

AGONES_STATUS=$(helm status agones)
echo "agones status is $AGONES_STATUS"

if helm status local-redis >/dev/null; then
    echo "redis is installed"
else
    echo "redis is not installed"

    helm install local-redis redis/redis
    sleep 20
fi

REDIS_STATUS=$(helm status local-redis)
echo "redis status is $REDIS_STATUS"

#================
# Verify XREngine
#================

echo "XREngine docker images build starting"
./scripts/build_minikube.sh

if helm status local >/dev/null; then
    echo "XREngine is installed"
else
    echo "XREngine is not installed"

    helm install -f ../local.values.yaml --set api.extraEnv.FORCE_DB_REFRESH=true local xrengine/xrengine
    sleep 30
    helm upgrade --reuse-values --set api.extraEnv.FORCE_DB_REFRESH=false local xrengine/xrengine
    sleep 30
fi

XRENGINE_STATUS=$(helm status local)
echo "XREngine status is $XRENGINE_STATUS"

exit 0
