#!/bin/bash

export DOCKER_REGISTRY=${DOCKER_REGISTRY:-localhost:5000/}

export PG_ADMIN_USER=${PG_ADMIN_USER:-pgroot}
export PG_ADMIN_PASSWORD=${PG_ADMIN_PASSWORD:-pgrootsecret}

export PGADMIN_DEFAULT_EMAIL=${PGADMIN_DEFAULT_EMAIL:-admin@pg.org}
export PGADMIN_DEFAULT_PASSWORD=${PGADMIN_DEFAULT_PASSWORD:-admin}

export KC_ADMIN_USER=${KC_ADMIN_USER:-kcadmin}
export KC_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD:-kcadminsecret}

# Create tracing service
kubectl apply -f tracing/tracing.yaml

# Create monitoring service
kubectl apply -f monitoring/prometheus-namespace.yaml
kubectl apply -f monitoring/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus-rules.yaml
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/node-exp-daemonset.yaml

# Create Postgresql service
(
    cd pgsql || exit

    docker build -t "${DOCKER_REGISTRY}"pgsql:13 .
    docker push "${DOCKER_REGISTRY}"pgsql:13

    # create secrets if needed
    n=$(kubectl get secrets | grep -q pgsql-admin; echo $?)
    if [ "$n" == 1 ]; then
        kubectl create secret generic pgsql-admin --from-literal=username="${PG_ADMIN_USER}" --from-literal=password="${PG_ADMIN_PASSWORD}"
    fi
    n=$(kubectl get secrets | grep -q pgadmin-admin; echo $?)
    if [ "$n" == 1 ]; then
        kubectl create secret generic pgadmin-admin --from-literal=username="${PGADMIN_DEFAULT_EMAIL}" --from-literal=password="${PGADMIN_DEFAULT_PASSWORD}"
    fi

    kubectl apply -f pg_volume.yaml
    kubectl apply -f pg_service.yaml
    kubectl apply -f pgadmin.yaml
)

# wait for pgsql to be ready
pgpod=$(kubectl get pods --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | grep pgsql)
kubectl wait --for=condition=ready pod/"${pgpod}"
# rem wait a few second for postgresql init
sleep 10

# Create authentication service
#      keycloak use a psql BD as backend
kubectl exec "${pgpod}" -- /run/postgresql/pg_add_app.sh keycloak

ret=$(kubectl get configmap kcrealm 1>/dev/null 2>&1 ; echo $?)
if [ "${ret}" == 1 ]; then
    kubectl create configmap kcrealm --from-file=./keycloak/realm-export.json
fi
n=$(kubectl get secrets | grep -q keycloak-admin; echo $?)
if [ "$n" == 1 ]; then
    kubectl create secret generic keycloak-admin --from-literal=username="${KC_ADMIN_USER}" --from-literal=password="${KC_ADMIN_PASSWORD}"
fi
kubectl apply -f keycloak/keycloak.yaml
keycloakpod=$(kubectl get pods --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | grep keycloak)
kubectl wait --for=condition=ready pod/"${keycloakpod}"

# rem wait a few second for keycloak init
sleep 20
ret=$(kubectl exec "${keycloakpod}" -- /opt/jboss/keycloak/bin/kcadm.sh get realms/amazebot 1>/dev/null 2>&1 ; echo $?)

if [ "${ret}" == 1 ]; then
    kubectl exec "${keycloakpod}" -- /opt/jboss/keycloak/bin/kcadm.sh config credentials --server http://keycloak:8080/auth --realm master --user "${KC_ADMIN_USER}" --password "${KC_ADMIN_PASSWORD}"
    kubectl exec "${keycloakpod}" -- /opt/jboss/keycloak/bin/kcadm.sh create realms -s realm=amazebot -f /etc/custom/realm-export.json
fi

# create db for backend
kubectl exec "${pgpod}" -- /run/postgresql/pg_add_app.sh player
kubectl exec "${pgpod}" -- /run/postgresql/pg_add_app.sh maze
kubectl exec "${pgpod}" -- /run/postgresql/pg_add_app.sh game
