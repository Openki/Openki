#!/bin/sh
# One-shot bootstrap for the local dev Garage node: assigns the single-node
# layout, then creates the bucket + access key the app expects
# (see settings/local.json). Safe to run again on every `docker compose up`.
set -eu

BUCKET="openki-dev"
KEY_NAME="openki-dev-key"
KEY_ID="GK87d4cfd9b5f2420952301704"
SECRET_KEY="47397becaa4bf89f106ddfee98a6cfd32db956ea67d7f557396adb28c869b286"

echo "[garage-bootstrap] waiting for garage node..."
until /garage status >/dev/null 2>&1; do
  sleep 1
done

if /garage status | grep -q "NO ROLE ASSIGNED"; then
  NODE_ID=$(/garage status | awk '/NO ROLE ASSIGNED/{print $1; exit}')
  echo "[garage-bootstrap] assigning layout to node ${NODE_ID}"
  /garage layout assign -z dc1 -c 1G "${NODE_ID}"
  /garage layout apply --version 1
else
  echo "[garage-bootstrap] layout already assigned, skipping"
fi

if ! /garage bucket list | grep -q "${BUCKET}"; then
  echo "[garage-bootstrap] creating bucket ${BUCKET}"
  /garage bucket create "${BUCKET}"
else
  echo "[garage-bootstrap] bucket ${BUCKET} already exists, skipping"
fi

if ! /garage key list | grep -q "${KEY_NAME}"; then
  echo "[garage-bootstrap] importing dev access key"
  /garage key import "${KEY_ID}" "${SECRET_KEY}" -n "${KEY_NAME}" --yes
else
  echo "[garage-bootstrap] key ${KEY_NAME} already exists, skipping"
fi

echo "[garage-bootstrap] granting ${KEY_NAME} access to ${BUCKET}"
/garage bucket allow --key "${KEY_NAME}" --read --write --owner "${BUCKET}"

echo "[garage-bootstrap] enabling public website access on ${BUCKET}"
/garage bucket website --allow "${BUCKET}"

echo "[garage-bootstrap] done"
