#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="3100"
PID_FILE="${ADMIN_DEV_PID_FILE:-/tmp/ala-pet-admin-dev.pid}"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

log() {
  printf '[ala-pet-admin dev-reset] %s\n' "$*"
}

stop_pid() {
  local pid="$1"
  if [[ -z "${pid}" ]]; then
    return
  fi
  if ! kill -0 "${pid}" >/dev/null 2>&1; then
    return
  fi
  log "stopping process ${pid}"
  kill "${pid}" >/dev/null 2>&1 || true
  for _ in {1..10}; do
    if ! kill -0 "${pid}" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done
  log "force killing process ${pid}"
  kill -9 "${pid}" >/dev/null 2>&1 || true
}

cd "${ROOT_DIR}"

if [[ -f "${PID_FILE}" ]]; then
  stop_pid "$(cat "${PID_FILE}" 2>/dev/null || true)"
  rm -f "${PID_FILE}"
fi

if command -v docker >/dev/null 2>&1; then
  published_containers="$(docker ps -q --filter "publish=${PORT}" 2>/dev/null || true)"
  named_containers="$(docker ps -q --filter "name=ala-pet-admin" 2>/dev/null || true)"
  containers="$(printf '%s\n%s\n' "${published_containers}" "${named_containers}" | awk 'NF' | sort -u)"
  if [[ -n "${containers}" ]]; then
    log "stopping docker containers on admin port/name"
    docker stop ${containers} >/dev/null 2>&1 || true
  fi
fi

pids="$(lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null | awk 'NR > 1 {print $2}' | sort -u || true)"
for pid in ${pids}; do
  stop_pid "${pid}"
done

if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  log "port ${PORT} is still occupied"
  lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN || true
  exit 1
fi

log "port ${PORT} is free"