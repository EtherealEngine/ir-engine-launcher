const Commands = {
  DOCKER_STATS: "eval $(minikube docker-env); docker system df --format='{{json .}}'; eval $(minikube docker-env -u);",
  DOCKER_PRUNE: 'eval $(minikube docker-env); docker system prune -a -f; eval $(minikube docker-env -u);',
  DASHBOARD: 'minikube dashboard --url',
  MINIKUBE_REMOVE: 'minikube delete --all --purge=true',
  VIRTUALBOX_REMOVE: 'apt-get remove -y --purge virtualbox',
  VIRTUALBOX_DKMS_REMOVE: 'apt-get remove -y --purge virtualbox-dkms '
}

export default Commands
