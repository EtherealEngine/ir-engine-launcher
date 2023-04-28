#!/bin/bash

set -e

#===========
# Parameters
#===========

PASSWORD=$1
ASSETS_FOLDER=$2

#================
# Verify MicroK8s
#================

CONFIGURE_MICROK8S=false
if echo "$PASSWORD" | sudo -S microk8s version >/dev/null; then
    echo "microk8s is installed"
else
    echo "microk8s is not installed"

    echo "$PASSWORD" | sudo -S snap install microk8s --classic --channel=1.26/stable

    CONFIGURE_MICROK8S=true

    echo "$PASSWORD" | sudo -S usermod -a -G microk8s $USER
    echo "$PASSWORD" | sudo -S chown -R $USER ~/.kube

    # Update kubelet & known_tokens if hostname is not supported.
    HOSTNAME=$(hostname)
    echo "Hostname is: $HOSTNAME"

    if [[ "$HOSTNAME" =~ [[:upper:]] || "$HOSTNAME" =~ _ ]]; then
        echo "Hostname is invalid. Uppercase or underscore character found"

        echo "$PASSWORD" | sudo -S chmod a+rwx /var/snap/microk8s/current
        echo "$PASSWORD" | sudo -S chmod a+rwx /var/snap/microk8s/current/args
        echo "$PASSWORD" | sudo -S chmod a+rwx /var/snap/microk8s/current/args/kubelet

        echo "$PASSWORD" | sudo -S chmod a+rwx /var/snap/microk8s/current/credentials
        echo "$PASSWORD" | sudo -S chmod a+rwx /var/snap/microk8s/current/credentials/known_tokens.csv

        # Ref: 'Node is not ready when RBAC is enabled' section of https://microk8s.io/docs/troubleshooting#heading--common-issues
        UPDATE_KUBELET=false
        if grep -q "hostname-override" /var/snap/microk8s/current/args/kubelet; then
            if grep -q "hostname-override=microk8s-node" /var/snap/microk8s/current/args/kubelet; then
                echo "kubelet hostname-override entry exists"
            else
                echo "kubelet hostname-override entry outdated"
                grep -v 'hostname-override' /var/snap/microk8s/current/args/kubelet >/tmp/kubelet.tmp
                echo "$PASSWORD" | sudo -S cp /tmp/kubelet.tmp /var/snap/microk8s/current/args/kubelet
                UPDATE_KUBELET=true
            fi
        else
            UPDATE_KUBELET=true
        fi

        if $UPDATE_KUBELET; then
            echo "$PASSWORD" | sudo -S -- sh -c "echo '--hostname-override=microk8s-node' >>/var/snap/microk8s/current/args/kubelet"
            echo "kubelet hostname-override entry added"
        fi

        # Update hostname in known_tokens.csv
        #Ref: https://github.com/canonical/microk8s/issues/3755#issuecomment-1429298118
        #Ref: https://www.cyberciti.biz/faq/how-to-use-sed-to-find-and-replace-text-in-files-in-linux-unix-shell/
        echo "$PASSWORD" | sudo -S sed -i "s/$HOSTNAME/microk8s-node/g" "/var/snap/microk8s/current/credentials/known_tokens.csv"
        echo "known_tokens.csv updated"

        #Restart microk8s
        echo "Restarting microk8s to reflect hostname config changes"
        echo "$PASSWORD" | sudo -S snap restart microk8s
    else
        echo "Hostname is valid"
    fi
fi

#==============================
# Ensure kubeconfig of microk8s
#==============================

# Check if .kube directory exists
if [[ ! -d ~/.kube ]]; then
    mkdir ~/.kube
fi

microk8sConfig=~/.kube/config-microk8s
eval microk8sConfig=$microk8sConfig

echo "$PASSWORD" | sudo -S microk8s config > $microk8sConfig

echo "Exported microk8s kubeconfig to: $microk8sConfig"

kubectl config rename-context microk8s etherealengine-microk8s --kubeconfig="$microk8sConfig"

# Check if .bashrc file exists
if [[ ! -f ~/.bashrc ]]; then
    touch ~/.bashrc
fi


if [[ -z $KUBECONFIG ]]; then
    KUBECONFIG=$HOME/.kube/config
fi

export KUBECONFIG=$KUBECONFIG:$microk8sConfig

# Append config-microk8s in $KUBECONFIG paths of .bashrc
if grep -q "config-microk8s" ~/.bashrc; then
    echo "config-microk8s exists in KUBECONFIG of ~/.bashrc"
else
    echo "config-microk8s does not exist in KUBECONFIG of ~/.bashrc"

    echo "export KUBECONFIG=$KUBECONFIG" >> ~/.bashrc
    source ~/.bashrc
    
    echo "config-microk8s entry added in KUBECONFIG of ~/.bashrc"
fi

kubectl config use-context etherealengine-microk8s

MICROK8S_VERSION=$(echo "$PASSWORD" | sudo -S microk8s version)
echo "microk8s version is $MICROK8S_VERSION"

MICROK8S_STATUS=$(echo "$PASSWORD" | sudo -S microk8s status)
echo "microk8s status is $MICROK8S_STATUS"

#=======================================================
# Ensure microk8s is running with correct configurations
#=======================================================

if echo "$PASSWORD" | sudo -S microk8s status | grep -q 'microk8s is not running'; then
    CONFIGURE_MICROK8S=true
fi

if $CONFIGURE_MICROK8S; then
    echo "$PASSWORD" | sudo -S ufw allow in on cni0 && echo "$PASSWORD" | sudo -S ufw allow out on cni0
    echo "$PASSWORD" | sudo -S ufw default allow routed

    # To fix: IPtables FORWARD policy is DROP
    echo "$PASSWORD" | sudo -S iptables -P FORWARD ACCEPT

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

    # Inspect microk8s
    echo "$PASSWORD" | sudo -S microk8s inspect

    # Check microk8s status
    MICROK8S_STATUS=$(echo "$PASSWORD" | sudo -S microk8s status)
    echo "microk8s status is $MICROK8S_STATUS"

    if echo "$PASSWORD" | sudo -S microk8s status | grep -q 'microk8s is not running'; then
        echo "There is something wrong in your microk8s. Please fix all warnings in 'sudo microk8s inspect' and reboot. If you still face this issue then, try 'sudo snap remove microk8s --purge'"
        exit 4
    fi

    # Update kubernetes dashboard to allow skip login and update user role to have access to metrics.
    kubectl patch deployment kubernetes-dashboard -n kube-system --type 'json' -p '[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--enable-skip-login"}]'
    kubectl delete clusterrolebinding kubernetes-dashboard -n kube-system
    kubectl apply -f "$ASSETS_FOLDER/files/microk8s-dashboard.yaml"
fi
