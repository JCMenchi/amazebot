#!/bin/bash

PG_HOME=/usr
PGHOST=${PGHOST:-127.0.0.1}
PGPORT=${PGPORT:-5432}

ADMIN_USER=${ADMIN_USER:-pgr}
ADMIN_PASSWORD=${ADMIN_USER:-pgr}

show_help () {
    echo "Usage: $0 [-h] [ -u username] [ -p password ] dbname"
    echo "  Create new Database"
    echo "      -u username : PG admin user (default: ${ADMIN_USER})"
    echo "      -p password : PG admin user password"
}
# Decode args
OPTIND=1  # Reset in case getopts has been used previously in the shell.
while getopts ":h?u:p:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    u)
        export ADMIN_USER=${OPTARG}
        ;;
    p)
        export ADMIN_USER=${OPTARG}
        ;;
    esac
done
shift $((OPTIND -1))

if [ $# -ne 1 ]; then
	echo "Wrong number of argument."
	show_help
	exit 1
fi

APP=$1

APP_DB=${APP}db
APP_USER=${APP}user

# check if database exists
n=$(PGPASSWORD=${ADMIN_PASSWORD} psql -U "${ADMIN_USER}" -h"${PGHOST}" -p"${PGPORT}" -dpostgres -c'\l' | grep -c "${APP_DB}" )
if [ "${n}" -ne 0 ]; then
	echo "Database ${APP_DB} already created."
	exit 2
fi

# check if user exists
n=$(PGPASSWORD=${ADMIN_PASSWORD} psql -U "${ADMIN_USER}" -h"${PGHOST}" -p"${PGPORT}" -dpostgres -c 'select rolname FROM pg_roles;' | grep -c "${APP_USER}" )
if [ "${n}" -eq 0 ]; then
	echo "Create user: ${APP_USER}"
	PGPASSWORD=${ADMIN_PASSWORD} "${PG_HOME}"/bin/psql -U "${ADMIN_USER}" -h"${PGHOST}" -p"${PGPORT}" -dpostgres -c "CREATE USER ${APP_USER} WITH ROLE ${ADMIN_USER} PASSWORD '${APP_USER}'"
	PGPASSWORD=${ADMIN_PASSWORD} "${PG_HOME}"/bin/psql -U "${ADMIN_USER}" -h"${PGHOST}" -p"${PGPORT}" -dpostgres -c "CREATE DATABASE ${APP_DB} WITH OWNER = '${APP_USER}'"
	PGPASSWORD=${ADMIN_PASSWORD} "${PG_HOME}"/bin/psql -U "${ADMIN_USER}" -h"${PGHOST}" -p"${PGPORT}" -dpostgres -c "GRANT ALL PRIVILEGES ON DATABASE ${APP_DB} to ${APP_USER};"
else
	echo "User ${APP_USER} already created."
	exit 3
fi

# execute sql script with db name if provided
if [ -e "${APP}".sql ]; then
	PGPASSWORD=${APP_USER} "${PG_HOME}"/bin/psql -U "${APP_USER}" -h"${PGHOST}"  -p"${PGPORT}" -d"${APP_DB}" -f "${APP}".sql
fi

# show users
PGPASSWORD=${ADMIN_PASSWORD} "${PG_HOME}"/bin/psql -U "${ADMIN_USER}" -h"${PGHOST}"  -p"${PGPORT}" -dpostgres -c'\du'
# show databases
PGPASSWORD=${ADMIN_PASSWORD} "${PG_HOME}"/bin/psql -U "${ADMIN_USER}" -h"${PGHOST}"  -p"${PGPORT}" -dpostgres -c'\l'
