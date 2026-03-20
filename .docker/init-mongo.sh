#!/bin/bash
set -euo pipefail

echo "===> init-mongo.sh started"

# valida vars
: "${MONGO_INITDB_ROOT_USERNAME:?MONGO root user is required}"
: "${MONGO_INITDB_ROOT_PASSWORD:?MONGO root password is required}"
: "${APP_DB_NAME:?APP_DB_NAME is required}"
: "${APP_DB_USER:?APP_DB_USER is required}"
: "${APP_DB_PASS:?APP_DB_PASS is required}"

# espera o mongod ficar disponível (timeout)
MAX_WAIT=60
i=0
until mongosh --username "${MONGO_INITDB_ROOT_USERNAME}" \
             --password "${MONGO_INITDB_ROOT_PASSWORD}" \
             --authenticationDatabase admin \
             --eval "db.adminCommand({ ping: 1 })" >/dev/null 2>&1; do
  i=$((i+1))
  echo "Waiting for mongod... ($i/$MAX_WAIT)"
  if [ $i -ge $MAX_WAIT ]; then
    echo "ERROR: mongod did not respond in time" >&2
    exit 1
  fi
  sleep 1
done

echo "mongod ready — creating DBs/users if needed"

mongosh --username "${MONGO_INITDB_ROOT_USERNAME}" \
        --password "${MONGO_INITDB_ROOT_PASSWORD}" \
        --authenticationDatabase admin <<EOF
// cria DB/app user se não existir
const appDb = db.getSiblingDB("${APP_DB_NAME}");
if (!appDb.getUser("${APP_DB_USER}")) {
  appDb.createUser({
    user: "${APP_DB_USER}",
    pwd: "${APP_DB_PASS}",
    roles: [{ role: "readWrite", db: "${APP_DB_NAME}" }]
  });
  print("Created user ${APP_DB_USER} on ${APP_DB_NAME}");
} else {
  print("User ${APP_DB_USER} already exists on ${APP_DB_NAME} — skipping");
}
appDb.createCollection("default_collection");


EOF

echo "===> init-mongo.sh finished"
