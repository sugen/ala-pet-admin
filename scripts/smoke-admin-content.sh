#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8080}"
CURL_BIN="${CURL_BIN:-curl}"
LOG_FILE="${ADMIN_LOG_FILE:-/tmp/ala-pet-admin-dev.log}"

if ! command -v "${CURL_BIN}" >/dev/null 2>&1; then
  CURL_BIN="/usr/bin/curl"
fi

fail() {
  echo "admin content smoke failed: $*" >&2
  if [[ -f "${LOG_FILE}" ]]; then tail -200 "${LOG_FILE}" >&2 || true; fi
  exit 1
}

fail_page() {
  local message="$1"
  local url="$2"
  local status="$3"
  local body_file="$4"

  echo "admin content smoke failed: ${message}" >&2
  echo "FAILED_URL=${url}" >&2
  echo "HTTP_STATUS=${status}" >&2
  echo "PAGE_FIRST_500=" >&2
  if [[ -f "${body_file}" ]]; then LC_ALL=C head -c 500 "${body_file}" >&2 || true; fi
  echo >&2
  echo "ADMIN_DEV_LOG_LAST_200=" >&2
  if [[ -f "${LOG_FILE}" ]]; then tail -200 "${LOG_FILE}" >&2 || true; fi
  exit 1
}

command -v jq >/dev/null 2>&1 || fail "jq is required"

login_response="$("${CURL_BIN}" -sS --max-time 10 -H 'Content-Type: application/json' --data '{"username":"admin","password":"AlaPet@2026"}' "${API_BASE_URL}/api/admin/login")"
token="$(jq -r '.data.token // empty' <<<"${login_response}")"
if [[ -z "${token}" ]]; then fail "admin login failed"; fi

page_body="$(mktemp)"
page_status="$("${CURL_BIN}" -sS --max-time 10 -o "${page_body}" -w '%{http_code}' "${BASE_URL}/articles/create" || true)"
if [[ "${page_status}" != "200" ]]; then fail_page "article create page expected 200, got ${page_status}" "${BASE_URL}/articles/create" "${page_status}" "${page_body}"; fi
grep -F "来源信息" "${page_body}" >/dev/null || fail_page "source tab missing" "${BASE_URL}/articles/create" "${page_status}" "${page_body}"
grep -F "合规审核" "${page_body}" >/dev/null || fail_page "compliance tab missing" "${BASE_URL}/articles/create" "${page_status}" "${page_body}"
grep -F "SEO 标签" "${page_body}" >/dev/null || fail_page "seo tab missing" "${BASE_URL}/articles/create" "${page_status}" "${page_body}"
rm -f "${page_body}"

timestamp="$(date +%Y%m%d%H%M%S)"
create_payload="$(cat <<JSON
{
  "title": "D12 high risk admin smoke ${timestamp}",
  "slug": "d12-high-risk-admin-smoke-${timestamp}",
  "publish_type": "news",
  "summary": "high risk smoke",
  "content": "high risk smoke content",
  "source_name": "D12 admin smoke source",
  "source_url": "http://127.0.0.1/admin-content-smoke",
  "source_type": "web",
  "rewrite_method": "manual",
  "copyright_risk": "high",
  "risk_level": "high",
  "human_review_required": true,
  "status": "draft"
}
JSON
)"
create_response="$("${CURL_BIN}" -sS --max-time 10 -H "Authorization: Bearer ${token}" -H 'Content-Type: application/json' --data "${create_payload}" "${API_BASE_URL}/api/admin/articles")"
article_id="$(jq -r '.data.id // empty' <<<"${create_response}")"
if [[ -z "${article_id}" ]]; then fail "create high risk article failed"; fi

publish_status="$("${CURL_BIN}" -sS --max-time 10 -o /tmp/d12-admin-publish-response.json -w '%{http_code}' -H "Authorization: Bearer ${token}" -H 'Content-Type: application/json' --data '{"human_review_confirmed":true}' "${API_BASE_URL}/api/admin/articles/${article_id}/publish" || true)"
if [[ "${publish_status}" =~ ^2[0-9][0-9]$ ]]; then fail "high risk article published unexpectedly"; fi
rm -f /tmp/d12-admin-publish-response.json

"${CURL_BIN}" -sS --max-time 10 -X DELETE -H "Authorization: Bearer ${token}" "${API_BASE_URL}/api/admin/articles/${article_id}" >/dev/null || true

echo "admin content smoke ok"