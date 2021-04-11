#!/bin/bash

DOCKER_REGISTRY=localhost:5000/

SUBDIR="mazemgr playermgr gamemgr"

for d in ${SUBDIR}; do
    cd "$d" || exit
    npm install
    npm run test
    npm run coverage
    # npm build install only needed dependencies to limit container size
    npm run build
    container_label=$(node -p "require('./package.json').version")
    docker build -t "${d}":"${container_label}" .
    docker tag "${d}":"${container_label}" ${DOCKER_REGISTRY}"${d}":"${container_label}"
    docker push ${DOCKER_REGISTRY}"${d}":"${container_label}"
    cd ..
done

