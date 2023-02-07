#!/bin/bash

#===========
# Parameters
#===========

PASSWORD=$1
ASSETS_FOLDER=$2

#================
# Verify MicroK8s
#================

if echo "$PASSWORD" | sudo -S microk8s version >/dev/null; then
    echo "microk8s is installed"
else
    echo "microk8s is not installed"

    echo "$PASSWORD" | sudo -S snap install microk8s --classic --channel=1.26/stable

    echo "$PASSWORD" | sudo -S usermod -a -G microk8s $USER
    echo "$PASSWORD" | sudo -S chown -R $USER ~/.kube

    # Remove previous context from config
    if kubectl config view --raw | grep -q 'microk8s'; then
        kubectl config delete-context microk8s
    fi

    # Remove previous cluster from config
    if kubectl config view --raw | grep -q 'microk8s-cluster'; then
        kubectl config delete-cluster microk8s-cluster
    fi

    # Remove previous user from config
    if kubectl config view --raw | grep -q 'microk8s-admin'; then
        kubectl config delete-user microk8s-admin
    fi

    # Ensure the certificate is accessible. Ref: https://askubuntu.com/a/720000/1558816
    echo "$PASSWORD" | sudo -S chmod a+rwx /var/snap/microk8s/current/certs/
    echo "$PASSWORD" | sudo -S chmod a+rwx /var/snap/microk8s/current/certs/ca.crt

    # Ref: https://discuss.kubernetes.io/t/use-kubectl-with-microk8s/5313/6
    kubectl config set-cluster microk8s --server=https://127.0.0.1:16443/ --certificate-authority=/var/snap/microk8s/current/certs/ca.crt
    kubectl config set-credentials microk8s-admin --token="$(echo "$PASSWORD" | sudo -S microk8s kubectl config view --raw -o 'jsonpath={.users[0].user.token}')"
    kubectl config set-context microk8s --cluster=microk8s --namespace=default --user=microk8s-admin
fi

kubectl config use-context microk8s

MICROK8S_VERSION=$(echo "$PASSWORD" | sudo -S microk8s version)
echo "microk8s version is $MICROK8S_VERSION"

MICROK8S_STATUS=$(echo "$PASSWORD" | sudo -S microk8s status)
echo "microk8s status is $MICROK8S_STATUS"

if echo "$PASSWORD" | sudo -S microk8s status | grep -q 'microk8s is not running'; then
    echo "$PASSWORD" | sudo -S ufw allow in on cni0 && echo "$PASSWORD" | sudo -S ufw allow out on cni0
    echo "$PASSWORD" | sudo -S ufw default allow routed

    # Start microk8s
    echo "$PASSWORD" | sudo -S microk8s start

    # Enable Addons
    echo "$PASSWORD" | sudo -S microk8s enable dashboard
    echo "$PASSWORD" | sudo -S microk8s enable dns
    echo "$PASSWORD" | sudo -S microk8s enable registry
    # Since below command can cause terminal to exit.
    set +e
    echo "$PASSWORD" | sudo -S microk8s enable host-access
    set -e
    echo "$PASSWORD" | sudo -S microk8s enable ingress
    echo "$PASSWORD" | sudo -S microk8s enable rbac
    echo "$PASSWORD" | sudo -S microk8s enable hostpath-storage
    echo "$PASSWORD" | sudo -S microk8s enable helm3

    sleep 30

    # Update kubernetes dashboard to allow skip login and update user role to have access to metrics.
    kubectl patch deployment kubernetes-dashboard -n kube-system --type 'json' -p '[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--enable-skip-login"}]'
    kubectl delete clusterrolebinding kubernetes-dashboard -n kube-system
    kubectl apply -f "$ASSETS_FOLDER/files/microk8s-dashboard.yaml"

    # Inspect microk8s
    echo "$PASSWORD" | sudo -S microk8s inspect

    # Check microk8s status
    MICROK8S_STATUS=$(echo "$PASSWORD" | sudo -S microk8s status)
    echo "microk8s status is $MICROK8S_STATUS"

    if echo "$PASSWORD" | sudo -S microk8s status | grep -q 'microk8s is not running'; then
        echo "There is something wrong in your microk8s. Please fix all warnings in 'sudo microk8s inspect' and reboot. If you still face this issue then, try 'sudo snap remove microk8s --purge'"
        exit 4
    fi
fi