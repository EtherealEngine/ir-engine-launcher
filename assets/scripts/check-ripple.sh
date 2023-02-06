#!/bin/bash

#===========
# Parameters
#===========

ENABLE_RIPPLE_STACK=$1
ENGINE_FOLDER=$2

#====================
# Verify ripple stack
#====================

echo "Enable ripple stack is $ENABLE_RIPPLE_STACK"

if [[ $ENABLE_RIPPLE_STACK == 'true' ]]; then
    if helm status local-rippled >/dev/null; then
        echo "rippled is already deployed"
    else
        echo "rippled is not deployed"

        helm install local-rippled "$ENGINE_FOLDER/packages/ops/rippled/"
        sleep 20
    fi

    RIPPLED_STATUS=$(helm status local-rippled)
    echo "rippled status is $RIPPLED_STATUS"

    if helm status local-ipfs >/dev/null; then
        echo "ipfs is already deployed"
    else
        echo "ipfs is not deployed"

        helm install -f "$CONFIGS_FOLDER/$CLUSTER_ID-ipfs.values.yaml" local-ipfs "$ENGINE_FOLDER/packages/ops/ipfs/"
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