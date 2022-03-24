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

    sudo apt-get remove -y docker docker-engine docker.io containerd runc
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release

    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

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
