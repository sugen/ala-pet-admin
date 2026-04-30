#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/.env}"

env_value() {
  local key="$1"
  local fallback="$2"
  local line

  if [[ -f "${ENV_FILE}" ]]; then
    line="$(grep -E "^${key}=" "${ENV_FILE}" | tail -n 1 || true)"
    if [[ -n "${line}" ]]; then
      printf '%s' "${line#*=}"
      return
    fi
  fi

  printf '%s' "${fallback}"
}

HOST_PORT="$(env_value ADMIN_PORT 3100)"
for _ in {1..30}; do
  if curl -fsS -L "http://127.0.0.1:${HOST_PORT}/" >/dev/null; then
    echo "ala-pet-admin healthcheck ok"
    exit 0
  fi
  sleep 1
done

curl -fsS -L "http://127.0.0.1:${HOST_PORT}/" >/dev/null
echo "ala-pet-admin healthcheck ok"
