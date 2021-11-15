#!/bin/bash

DOCKER_REGISTRY=${DOCKER_REGISTRY:-localhost:5000/}

CONTAINER=amazeui

npm install
# npm build install only needed dependencies to limit container size
npm run build
CONTAINER_TAG=$(node -p "require('./package.json').version")
docker build -t "${DOCKER_REGISTRY}""${CONTAINER}":"${CONTAINER_TAG}" .
docker push "${DOCKER_REGISTRY}""${CONTAINER}":"${CONTAINER_TAG}"
npm install
