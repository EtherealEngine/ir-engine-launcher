#!/bin/bash

set -e

#===========
# Parameters
#===========

while getopts f: flag; do
    case "${flag}" in
    f) ENGINE_FOLDER=${OPTARG} ;;
    *)
        echo "Invalid arguments passed" >&2
        exit 1
        ;;
    esac
done

if [[ -z $ENGINE_FOLDER ]]; then
    echo "Missing arguments"
    exit 1
fi

#=========================
# Verify Local File Server
#=========================

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion

if lsof -Pi :8642 -sTCP:LISTEN -t >/dev/null; then
    echo "file server is configured"
    lsof -Pi :8642 -sTCP:LISTEN
else
    echo "file server is not configured"

    cd "$ENGINE_FOLDER"/packages/server

    npm run serve-local-files
fi

exit 0
