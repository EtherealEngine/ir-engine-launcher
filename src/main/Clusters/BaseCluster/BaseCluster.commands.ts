const Commands = {
  IPFS_SECRET: "od  -vN 32 -An -tx1 /dev/urandom | tr -d ' \n'",
  DOCKER_STATS: "docker system df --format='{{json .}}';",
  DOCKER_PRUNE: 'docker system prune -a -f;'
}

export default Commands
