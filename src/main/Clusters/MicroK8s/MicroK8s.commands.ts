const Commands = {
  DASHBOARD: 'microk8s kubectl port-forward -n kube-system service/kubernetes-dashboard 10443:443',
  MICROK8S_REMOVE: 'snap remove microk8s --purge'
}

export default Commands
