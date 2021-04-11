#!/bin/bash

# check if db exist
if [ ! -d /var/lib/postgresql/data ]
then
	# Create a PostgreSQL db and some roles
	/usr/bin/initdb -E UTF8 -D/var/lib/postgresql/data

	# Adjust PostgreSQL configuration so that remote connections to the
	# database are possible.
	echo "host all  all    0.0.0.0/0  md5" >> /var/lib/postgresql/data/pg_hba.conf
	echo "host replication repuser 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
	echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

	pg_ctl -D/var/lib/postgresql/data start
	psql --command "CREATE USER pgr WITH CREATEDB CREATEROLE PASSWORD 'pgr';"
	psql --command "CREATE USER repuser WITH REPLICATION PASSWORD 'repuser';"
	pg_ctl -D/var/lib/postgresql/data stop
fi
#
#=================================================================================================================

# Start database
/usr/bin/postgres -D /var/lib/postgresql/data 2>&1