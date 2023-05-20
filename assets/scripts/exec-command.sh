#!/bin/bash

#===========
# Parameters
#===========

COMMAND=$1

#==================
# Ensure kubeconfig
#==================

# This is to ensure updated KUBECONFIG after microk8s being configured.
microk8sConfig=~/.kube/config-microk8s
eval microk8sConfig=$microk8sConfig

if [[ ! $KUBECONFIG == *"$microk8sConfig"* ]]; then
    export KUBECONFIG=$KUBECONFIG:$microk8sConfig
    source ~/.bashrc
fi

#========
# Command
#========

eval "$COMMAND"