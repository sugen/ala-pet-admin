#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${CONFIG_FILE:-${ROOT_DIR}/config/production.local.yaml}"

yaml_get() {
  ruby -ryaml -e 'data = YAML.load_file(ARGV[0]); ARGV[1].split(".").each { |key| data = data.fetch(key) }; print data' "${CONFIG_FILE}" "$1"
}

HOST_PORT="$(yaml_get docker.host_port)"
for _ in {1..30}; do
  if curl -fsS -L "http://127.0.0.1:${HOST_PORT}/" >/dev/null; then
    echo "ala-pet-admin healthcheck ok"
    exit 0
  fi
  sleep 1
done

curl -fsS -L "http://127.0.0.1:${HOST_PORT}/" >/dev/null
echo "ala-pet-admin healthcheck ok"
