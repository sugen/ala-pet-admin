#!/usr/bin/env bash
set -Eeuo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-${API_BASE_URL:-http://127.0.0.1:8080}}"
LOG_FILE="${ADMIN_LOG_FILE:-/tmp/ala-pet-admin-dev.log}"
CURL_BIN="${CURL_BIN:-curl}"
RUN_TYPECHECK="${RUN_TYPECHECK:-1}"
LAST_ENDPOINT=""
LAST_STATUS=""
LAST_RESPONSE=""

if ! command -v "${CURL_BIN}" >/dev/null 2>&1; then
  CURL_BIN="/usr/bin/curl"
fi

log() {
  printf '[ala-pet-admin smoke-all] %s\n' "$*"
}

show_logs() {
  if [[ -f "${LOG_FILE}" ]]; then
    log "last 200 admin log lines:"
    tail -n 200 "${LOG_FILE}" || true
  else
    log "admin log file not found: ${LOG_FILE}"
  fi
}

fail() {
  log "FAILED: $*" >&2
  if [[ -n "${LAST_ENDPOINT}" ]]; then
    log "endpoint: ${LAST_ENDPOINT}" >&2
  fi
  if [[ -n "${LAST_STATUS}" ]]; then
    log "http_status: ${LAST_STATUS}" >&2
  fi
  if [[ -n "${LAST_RESPONSE}" ]]; then
    log "response:" >&2
    printf '%s\n' "${LAST_RESPONSE}" >&2
  fi
  show_logs >&2
  exit 1
}

wait_http() {
  local label="$1"
  local url="$2"

  LAST_ENDPOINT="GET ${url}"
  for _ in {1..30}; do
    if "${CURL_BIN}" -fsS --max-time 10 "${url}" >/dev/null; then
      log "${label} ok"
      return 0
    fi
    sleep 1
  done
  return 1
}

check_admin_login() {
  local body_file

  body_file="$(mktemp)"
  LAST_ENDPOINT="POST ${API_BASE_URL}/api/admin/login"
  if ! LAST_STATUS="$("${CURL_BIN}" -sS --max-time 10 -o "${body_file}" -w '%{http_code}' -X POST -H 'Content-Type: application/json' --data '{"username":"admin","password":"AlaPet@2026"}' "${API_BASE_URL}/api/admin/login")"; then
    LAST_RESPONSE="$(cat "${body_file}" 2>/dev/null || true)"
    rm -f "${body_file}"
    fail "admin login request failed"
  fi
  LAST_RESPONSE="$(cat "${body_file}" 2>/dev/null || true)"
  rm -f "${body_file}"
  if [[ "${LAST_STATUS}" != "200" ]]; then
    fail "admin login expected HTTP 200, got ${LAST_STATUS}"
  fi
  if ! printf '%s' "${LAST_RESPONSE}" | grep -Eq '"token"[[:space:]]*:'; then
    fail "admin login response missing token"
  fi
  log "admin login api ok"
}

check_production_mock_guard() {
  if ! grep -F 'NEXT_PUBLIC_API_MODE=mock is not allowed in production' "${ROOT_DIR}/lib/api.ts" >/dev/null; then
    fail "production mock guard not found in lib/api.ts"
  fi
  log "production mock guard ok"
}

check_page() {
  local path="$1"
  local body_file

  body_file="$(mktemp)"
  LAST_ENDPOINT="GET ${path}"
  if ! LAST_STATUS="$("${CURL_BIN}" -sS --max-time 10 -o "${body_file}" -w '%{http_code}' "${BASE_URL}${path}")"; then
    LAST_RESPONSE="$(cat "${body_file}" 2>/dev/null || true)"
    rm -f "${body_file}"
    fail "page request failed"
  fi
  LAST_RESPONSE="$(cat "${body_file}" 2>/dev/null || true)"
  rm -f "${body_file}"
  if [[ ! "${LAST_STATUS}" =~ ^[0-9]{3}$ ]] || [[ "${LAST_STATUS}" -lt 200 ]] || [[ "${LAST_STATUS}" -ge 400 ]]; then
    fail "page returned non-2xx/3xx status"
  fi
  log "${path} ${LAST_STATUS}"
}

check_console_pages() {
  local pages=(
    "/articles"
    "/daily"
    "/beauty"
    "/brands"
    "/public-voice"
    "/samples"
    "/sources"
    "/crawl-tasks"
    "/ai-tasks"
    "/raw-contents"
    "/public-events"
    "/indices"
    "/rankings"
    "/leads"
    "/seo"
    "/settings"
  )

  for page in "${pages[@]}"; do
    check_page "${page}"
  done
}

run_script() {
  local label="$1"
  shift
  log "running ${label}"
  "$@" || fail "${label} failed"
}

wait_http "api health" "${API_BASE_URL}/health" || fail "API health did not become available within 30 seconds"
check_admin_login
if [[ "${RUN_TYPECHECK}" == "1" ]]; then
  run_script "admin typecheck" npm --prefix "${ROOT_DIR}" run typecheck
fi
wait_http "admin health" "${BASE_URL}/login" || fail "Admin did not become available within 30 seconds"
check_production_mock_guard
run_script "admin ui smoke" env BASE_URL="${BASE_URL}" ADMIN_LOG_FILE="${LOG_FILE}" bash "${ROOT_DIR}/scripts/smoke-admin-ui.sh"
check_console_pages

log "smoke-all passed"