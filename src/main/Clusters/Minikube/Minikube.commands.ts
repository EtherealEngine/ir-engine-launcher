const Commands = {
  DOCKER_STATS: "eval $(minikube docker-env); docker system df --format='{{json .}}'; eval $(minikube docker-env -u);",
  DOCKER_PRUNE: 'eval $(minikube docker-env); docker system prune -a -f; eval $(minikube docker-env -u);',
  DASHBOARD: 'minikube dashboard --url',
  DATABASE_CLEAR:
    'docker container stop etherealengine__minikube_db; docker container rm etherealengine__minikube_db; docker container prune --force',
  MINIKUBE_REMOVE: 'minikube delete --all --purge=true'
}

export default Commands
