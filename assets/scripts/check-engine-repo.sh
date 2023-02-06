#!/bin/bash

#===========
# Parameters
#===========

ENGINE_FOLDER=$1

#=============
# Get Engine
#=============

if [[ -d $ENGINE_FOLDER ]] && [[ -f "$ENGINE_FOLDER/package.json" ]]; then
    echo "ethereal engine repo exists at $ENGINE_FOLDER"
else
    echo "cloning ethereal engine in $ENGINE_FOLDER"
    git clone https://github.com/XRFoundation/XREngine "$ENGINE_FOLDER"
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
