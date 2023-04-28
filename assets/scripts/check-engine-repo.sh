#!/bin/bash

set -e

#===========
# Parameters
#===========

ENGINE_FOLDER=$1
OPS_FOLDER=$2

#=============
# Get Engine
#=============

if [[ -d $OPS_FOLDER ]]; then
    echo "ethereal engine ops repo exists at $OPS_FOLDER"
else
    echo "cloning ethereal engine ops in $OPS_FOLDER"
    git clone https://github.com/etherealengine/ethereal-engine-ops "$OPS_FOLDER"
fi

if [[ -d $ENGINE_FOLDER ]] && [[ -f "$ENGINE_FOLDER/package.json" ]]; then
    echo "ethereal engine repo exists at $ENGINE_FOLDER"
else
    echo "cloning ethereal engine in $ENGINE_FOLDER"
    git clone https://github.com/etherealengine/etherealengine "$ENGINE_FOLDER"
fi

cd "$ENGINE_FOLDER" || exit

if [[ -f ".env.local" ]]; then
    echo "env file exists at $ENGINE_FOLDER/.env.local"
else
    cp ".env.local.default" ".env.local"
    echo "env file created at $ENGINE_FOLDER/.env.local"
fi

echo "running npm install"
npm install
echo "completed npm install"
