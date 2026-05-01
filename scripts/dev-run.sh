#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="3100"
API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-${API_BASE_URL:-http://127.0.0.1:8080}}"
PID_FILE="${ADMIN_DEV_PID_FILE:-/tmp/ala-pet-admin-dev.pid}"
LOG_FILE="${ADMIN_DEV_LOG_FILE:-/tmp/ala-pet-admin-dev.log}"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

log() {
  printf '[ala-pet-admin dev-run] %s\n' "$*"
}

fail() {
  log "ERROR: $*"
  if [[ -f "${LOG_FILE}" ]]; then
    log "last 200 log lines:"
    tail -n 200 "${LOG_FILE}" || true
  fi
  exit 1
}

cd "${ROOT_DIR}"

if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  log "port ${PORT} is occupied; running dev-reset first"
  bash "${ROOT_DIR}/scripts/dev-reset.sh"
fi

rm -f "${LOG_FILE}"
log "starting admin on fixed port ${PORT}"
NEXT_PUBLIC_API_MODE="real" \
NEXT_PUBLIC_API_BASE_URL="${API_BASE_URL}" \
npm run dev >"${LOG_FILE}" 2>&1 &
pid="$!"
printf '%s' "${pid}" >"${PID_FILE}"

for _ in {1..30}; do
  if ! kill -0 "${pid}" >/dev/null 2>&1; then
    rm -f "${PID_FILE}"
    fail "admin process exited before healthcheck passed"
  fi
  if curl -fsS -L --max-time 10 "http://127.0.0.1:${PORT}/login" >/dev/null; then
    log "admin is healthy on port ${PORT}"
    exit 0
  fi
  sleep 1
done

kill "${pid}" >/dev/null 2>&1 || true
rm -f "${PID_FILE}"
fail "healthcheck did not pass within 30 seconds"