#!/bin/bash

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
        echo "Invalid arguments passed" >&2
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

LOGIN=$(echo "$PASSWORD" | sudo -S echo "User logged in")
if [[ $LOGIN == *"User logged in"* ]]; then
    echo "user logged in"
else
    echo "user not logged in"
    exit 2
fi

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
        echo "$PASSWORD" | sudo -S apt install curl
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
    exit 3
fi

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

#=============
# Verify Make
#=============

if make --version >/dev/null; then
    echo "make is installed"
else
    echo "make is not installed"

    echo "$PASSWORD" | sudo -S apt-get update -y
    echo "$PASSWORD" | sudo -S apt-get install -y build-essential
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

    echo "$PASSWORD" | sudo -S apt-get update -y
    echo "$PASSWORD" | sudo -S apt-get install -y git
fi

GIT_VERSION=$(git --version)
echo "git version is $GIT_VERSION"

#=============
# Get Engine
#=============

if [[ -d $ENGINE_FOLDER ]] && [[ -f "$ENGINE_FOLDER/package.json" ]]; then
    echo "ethereal engine repo exists at $ENGINE_FOLDER"
else
    echo "cloning ethereal engine in $ENGINE_FOLDER"
    git clone https://github.com/XRFoundation/XREngine "$ENGINE_FOLDER"
fi

cd "$ENGINE_FOLDER"

if [[ -f ".env.local" ]]; then
    echo "env file exists at $ENGINE_FOLDER/.env.local"
else
    cp ".env.local.default" ".env.local"
    echo "env file created at $ENGINE_FOLDER/.env.local"
fi

echo "running npm install"
npm install
echo "completed npm install"

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

    echo "$PASSWORD" | sudo -S curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    echo "$PASSWORD" | sudo -S chmod +x /usr/local/bin/docker-compose
fi

DOCKER_COMPOSE_VERSION=$(docker-compose --version)
echo "docker-compose version is $DOCKER_COMPOSE_VERSION"

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

if kubectl version --client >/dev/null; then
    echo "kubectl is installed"
else
    echo "kubectl is not installed"

    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    echo "$PASSWORD" | sudo -S install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm kubectl -f
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

    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
    echo "$PASSWORD" | sudo -S chmod 700 get_helm.sh
    echo "$PASSWORD" | sudo -S bash get_helm.sh
    rm get_helm.sh -f
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
    echo "agones is already deployed"
else
    echo "agones is not deployed"

    helm install -f packages/ops/configs/agones-default-values.yaml agones agones/agones
    sleep 20
fi

AGONES_STATUS=$(helm status agones)
echo "agones status is $AGONES_STATUS"

if helm status local-redis >/dev/null; then
    echo "redis is already deployed"
else
    echo "redis is not deployed"

    helm install local-redis redis/redis
    sleep 20
fi

REDIS_STATUS=$(helm status local-redis)
echo "redis status is $REDIS_STATUS"

#====================
# Verify ripple stack
#====================

echo "Enable ripple stack is $ENABLE_RIPPLE_STACK"

if [[ $ENABLE_RIPPLE_STACK == 'true' ]]; then
    if helm status local-rippled >/dev/null; then
        echo "rippled is already deployed"
    else
        echo "rippled is not deployed"

        helm install local-rippled ./packages/ops/rippled/
        sleep 20
    fi

    RIPPLED_STATUS=$(helm status local-rippled)
    echo "rippled status is $RIPPLED_STATUS"


    if helm status local-ipfs >/dev/null; then
        echo "ipfs is already deployed"
    else
        echo "ipfs is not deployed"

        helm install -f "$CONFIGS_FOLDER/$CLUSTER_ID-ipfs.values.yaml" local-ipfs ./packages/ops/ipfs/
        sleep 20
    fi

    IPFS_STATUS=$(helm status local-ipfs)
    echo "ipfs status is $IPFS_STATUS"

else
    if helm status local-rippled >/dev/null; then
        helm uninstall local-rippled
        echo "rippled deployment removed"
    fi

    if helm status local-ipfs >/dev/null; then
        helm uninstall local-ipfs
        echo "ipfs deployment removed"
    fi
fi


#=======================
# Verify Ethereal Engine
#=======================

PROJECTS_PATH="$ENGINE_FOLDER/packages/projects/projects/"

if [[ -d $PROJECTS_PATH ]]; then
    echo "ethereal engine projects exists at $PROJECTS_PATH"
else
    echo "ethereal engine projects does not exists at $PROJECTS_PATH"
    npm run install-projects
fi

echo "Ethereal Engine docker images build starting"
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0
./scripts/build_minikube.sh

ENGINE_INSTALLED=false
if helm status local >/dev/null; then
    ENGINE_INSTALLED=true
    echo "Ethereal Engine is installed"
else
    echo "Ethereal Engine is not installed"
fi

export MYSQL_PORT=3304
DB_STATUS=$(npm run check-db-exists-only)
DB_EXISTS=false
if [[ $DB_STATUS == *"database found"* ]]; then
    DB_EXISTS=true
    echo "Existing database populated"
elif [[ $DB_STATUS == *"database not found"* ]]; then
    echo "Existing database not populated"
fi

echo "Force DB refresh is $FORCE_DB_REFRESH"

REFRESH_TRUE_PATH="$ASSETS_FOLDER/files/db-refresh-true.values.yaml"
REFRESH_FALSE_PATH="$ASSETS_FOLDER/files/db-refresh-false.values.yaml"

if [[ $ENGINE_INSTALLED == true ]] && [[ $DB_EXISTS == false || $FORCE_DB_REFRESH == 'true' ]]; then
    echo "Updating Ethereal Engine deployment to configure database"
    helm upgrade --reuse-values -f "$REFRESH_TRUE_PATH" local xrengine/xrengine
    sleep 35
    helm upgrade --reuse-values -f "$REFRESH_FALSE_PATH" local xrengine/xrengine
elif [[ $ENGINE_INSTALLED == false ]] && [[ $DB_EXISTS == false || $FORCE_DB_REFRESH == 'true' ]]; then
    echo "Installing Ethereal Engine deployment with populating database"
    helm install -f "$CONFIGS_FOLDER/$CLUSTER_ID-engine.values.yaml" -f "$REFRESH_TRUE_PATH" local xrengine/xrengine
    sleep 35
    helm upgrade --reuse-values -f "$REFRESH_FALSE_PATH" local xrengine/xrengine
elif [[ $ENGINE_INSTALLED == false ]] && [[ $DB_EXISTS == true ]]; then
    echo "Installing Ethereal Engine deployment without populating database"
    helm install -f "$CONFIGS_FOLDER/$CLUSTER_ID-engine.values.yaml" local xrengine/xrengine
fi

export RELEASE_NAME=local
./scripts/check-engine.sh

ENGINE_STATUS=$(helm status local)
echo "Ethereal Engine status is $ENGINE_STATUS"

exit 0
