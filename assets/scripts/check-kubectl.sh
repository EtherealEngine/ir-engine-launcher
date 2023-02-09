#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1

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

if [[ ! -d ~/.kube ]]; then
    mkdir ~/.kube
fi

KUBECTL_VERSION=$(kubectl version --client)
echo "kubectl version is $KUBECTL_VERSION"