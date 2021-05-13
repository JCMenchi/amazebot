#!/bin/bash

DOCKER_REGISTRY=localhost:5000/

SUBDIR="mazemgr playermgr gamemgr ui"

usage() { echo "Usage: $0 cmp1 cmp2" 1>&2; exit 1; }

while getopts "h?" o; do
    case "${o}" in
        h)
            usage
            exit
            ;;
        *)
            usage
            exit
            ;;
    esac
done
shift $((OPTIND-1))

if [ $# -gt 0 ]; then
    SUBDIR="$*"
fi

for d in ${SUBDIR}; do
    (
        cd "$d" || exit
        echo "====================================================================="
        echo "== BUILD $d"
        npm install
        npm run test
        npm run coverage
        # npm build install only needed dependencies to limit container size
        npm run build
        container_label=$(node -p "require('./package.json').version")
        docker build -t ${DOCKER_REGISTRY}"${d}":"${container_label}" .
        docker push ${DOCKER_REGISTRY}"${d}":"${container_label}"
        npm install
    )
done

