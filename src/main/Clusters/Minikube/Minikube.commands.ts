const Commands = {
  DOCKER_STATS: "eval $(minikube docker-env); docker system df --format='{{json .}}'; eval $(minikube docker-env -u);",
  DOCKER_PRUNE: 'eval $(minikube docker-env); docker system prune -a -f; eval $(minikube docker-env -u);',
  DASHBOARD: 'minikube dashboard --url'
}

export default Commands
