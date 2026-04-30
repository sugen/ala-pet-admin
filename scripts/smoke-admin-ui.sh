#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
LOG_FILE="${ADMIN_LOG_FILE:-/tmp/ala-pet-admin-dev.log}"
CURL_BIN="${CURL_BIN:-curl}"

if ! command -v "${CURL_BIN}" >/dev/null 2>&1; then
  CURL_BIN="/usr/bin/curl"
fi

show_logs() {
  echo "recent logs:" >&2
  if [[ -f "${LOG_FILE}" ]]; then
    tail -200 "${LOG_FILE}" >&2 || true
    return
  fi
  if [[ -x "${ROOT_DIR}/scripts/logs.sh" ]]; then
    bash "${ROOT_DIR}/scripts/logs.sh" >&2 || true
    return
  fi
  echo "log file not found: ${LOG_FILE}" >&2
}

fail() {
  local path="$1"
  local http_status="$2"
  local body_file="$3"
  echo "admin ui smoke failed" >&2
  echo "path: ${path}" >&2
  echo "http_status: ${http_status}" >&2
  if [[ -s "${body_file}" ]]; then
    echo "response:" >&2
    cat "${body_file}" >&2
  fi
  show_logs
  rm -f "${body_file}"
  exit 1
}

check_page() {
  local path="$1"
  local body_file
  local http_status
  body_file="$(mktemp)"
  http_status="$(${CURL_BIN} -sS --max-time 10 -o "${body_file}" -w '%{http_code}' "${BASE_URL}${path}" || true)"
  echo "${path} ${http_status}"
  if [[ ! "${http_status}" =~ ^[0-9]{3}$ ]] || [[ "${http_status}" -lt 200 ]] || [[ "${http_status}" -ge 400 ]]; then
    fail "${path}" "${http_status}" "${body_file}"
  fi
  rm -f "${body_file}"
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

check_page "/login"
check_page "/dashboard"
check_page "/raw-contents"

echo "admin ui smoke ok"