#!/bin/bash

SUBDIR="gamemgr mazemgr playermgr"

for d in ${SUBDIR}; do
    cd "$d" || exit
    npm install
    npm run build
    npm run test
    npm run coverage
    cd ..
done

docker-compose build