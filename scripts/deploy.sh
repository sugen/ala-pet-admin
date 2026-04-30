#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${CONFIG_FILE:-${ROOT_DIR}/config/production.local.yaml}"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "missing config file: ${CONFIG_FILE}"
  exit 1
fi

yaml_get() {
  ruby -ryaml -e 'data = YAML.load_file(ARGV[0]); ARGV[1].split(".").each { |key| data = data.fetch(key) }; print data' "${CONFIG_FILE}" "$1"
}

yaml_get_optional() {
  ruby -ryaml -e 'data = YAML.load_file(ARGV[0]); ARGV[1].split(".").each { |key| data = data.is_a?(Hash) ? data[key] : nil }; print(data.nil? ? ARGV[2] : data)' "${CONFIG_FILE}" "$1" "$2"
}

IMAGE="$(yaml_get docker.image)"
CONTAINER="$(yaml_get docker.container_name)"
HOST_PORT="$(yaml_get docker.host_port)"
APP_PORT="$(yaml_get app.port)"
API_BASE_URL="$(yaml_get app.api_base_url)"
API_MODE="$(yaml_get_optional app.api_mode mock)"

docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL="${API_BASE_URL}" \
  --build-arg NEXT_PUBLIC_API_MODE="${API_MODE}" \
  -t "${IMAGE}" "${ROOT_DIR}"
docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
docker run -d \
  --name "${CONTAINER}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:${APP_PORT}" \
  -e NEXT_PUBLIC_API_BASE_URL="${API_BASE_URL}" \
  -e NEXT_PUBLIC_API_MODE="${API_MODE}" \
  "${IMAGE}"

"${ROOT_DIR}/scripts/healthcheck.sh"
