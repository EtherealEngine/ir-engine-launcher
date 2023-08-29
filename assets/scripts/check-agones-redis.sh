#!/bin/bash

set -e

#===========
# Parameters
#===========

OPS_FOLDER=$1

#======================
# Verify agones & redis
#======================

if helm status agones >/dev/null; then
    echo "agones is already deployed"
else
    echo "agones is not deployed"

    helm install -f "$OPS_FOLDER/configs/agones-default-values.yaml" agones agones/agones --version "1.33.0"
    sleep 20
fi

AGONES_STATUS=$(helm status agones)
echo "agones status is $AGONES_STATUS"

if helm status local-redis >/dev/null; then
    echo "redis is already deployed"
else
    echo "redis is not deployed"

    helm install local-redis redis/redis
    sleep 20
fi

REDIS_STATUS=$(helm status local-redis)
echo "redis status is $REDIS_STATUS"