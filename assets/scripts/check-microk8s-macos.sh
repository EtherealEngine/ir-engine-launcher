#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1
ASSETS_FOLDER=$2
USER_NAME=$3
CLUSTER_NAME=$4
CONTEXT_NAME=$5
NAMESPACE=$6
CLUSTER_URL=$7

#================
# Verify MicroK8s
#================

CONFIGURE_MICROK8S=false
if [[ "$("microk8s version")" ]]; then
    echo "microk8s is installed"
else
    echo "microk8s is not installed"

    # multipass is needed to package microk8s locally
    brew install --cask multipass

    brew install ubuntu/microk8s/microk8s
    microk8s install --channel=1.26

    echo "Installed multipass and microk8s"

    CONFIGURE_MICROK8S=true

    # # Remove previous context from config
    # if kubectl config view -o jsonpath='{.contexts}' | grep '$CONTEXT_NAME'; then
    #     kubectl config delete-context $CONTEXT_NAME
    # fi

    # # Remove previous cluster from config
    # if kubectl config view -o jsonpath='{.clusters}' | grep '$CLUSTER_NAME'; then
    #     kubectl config delete-cluster $CLUSTER_NAME
    # fi

    # # Remove previous user from config
    # if kubectl config view -o jsonpath='{.users}' | grep '$USER_NAME'; then
    #     kubectl config delete-user $USER_NAME
    # fi

    # echo "$PASSWORD" | sudo -S chmod a+rwx /etc/ssl/certs/
    # if [ -e /etc/ssl/certs/ca.crt ]; then
    #     echo "$PASSWORD" | sudo -S chmod a+rwx /etc/ssl/certs/ca.crt
    # fi

    # Ref: https://discuss.kubernetes.io/t/use-kubectl-with-microk8s/5313/6
    # kubectl config set-cluster $CLUSTER_NAME --server=https://kubernetes.docker.internal:6443/ --certificate-authority-data="$(echo "$PASSWORD" | sudo -S microk8s kubectl config view --raw -o 'jsonpath={.clusters[0].cluster.certificate-authority-data}')"
    # kubectl config set-credentials $USER_NAME --token="$(echo "$PASSWORD" | sudo -S microk8s kubectl config view --raw -o 'jsonpath={.users[0].user.token}')"
    # kubectl config set-context $CONTEXT_NAME --cluster=$CLUSTER_NAME --namespace=default --user=$USER_NAME
fi

# kubectl config use-context $CONTEXT_NAME

MICROK8S_VERSION=$(microk8s version)
echo "microk8s version is $MICROK8S_VERSION"

MICROK8S_STATUS=$(microk8s status)
echo "microk8s status is $MICROK8S_STATUS"

if microk8s status | grep 'microk8s is not running'; then
    CONFIGURE_MICROK8S=true
fi

if $CONFIGURE_MICROK8S; then
    # Start microk8s
    microk8s start

    # Enable Addons
    microk8s enable dashboard
    microk8s enable dns
    microk8s enable registry
    # Since below command can cause terminal to exit.
    set +e
    microk8s enable host-access
    set -e
    microk8s enable ingress
    microk8s enable rbac
    microk8s enable hostpath-storage
    microk8s enable helm3

    sleep 30

    # Inspect microk8s
    microk8s inspect

    # Check microk8s status
    MICROK8S_STATUS=$(microk8s status)
    echo "microk8s status is $MICROK8S_STATUS"

    if microk8s status | grep 'microk8s is not running'; then
        echo "There is something wrong in your microk8s. Please fix all warnings in 'sudo microk8s inspect' and reboot. If you still face this issue then, try 'sudo snap remove microk8s --purge'"
        exit 4
    fi

    # Update kubernetes dashboard to allow skip login and update user role to have access to metrics.
    # kubectl patch deployment kubernetes-dashboard -n "$NAMESPACE" --type 'json' -p '[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--enable-skip-login"}]'
    # kubectl delete clusterrolebinding kubernetes-dashboard -n "$NAMESPACE"
    # kubectl apply -f "$ASSETS_FOLDER/files/microk8s-dashboard.yaml"
fi
