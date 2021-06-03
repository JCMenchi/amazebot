#!/bin/bash

export EXTERNAL_AUTH_URL=${EXTERNAL_AUTH_URL:-http://localhost/auth}

# First install k8s and services

cd kind || exit

# create K8S cluster
./kind_create.sh
# give sometime to ingress
sleep 5
kubectl cluster-info --context kind-kmate

# Create services
./create_services.sh

cd ..

# build docker images
./build.sh

# install uisng helm
helm install --set auth.external_url="${EXTERNAL_AUTH_URL}" amaz amazchart
