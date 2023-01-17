const Commands = {
  DASHBOARD: 'microk8s kubectl port-forward -n kube-system service/kubernetes-dashboard 10443:443'
}

export default Commands
