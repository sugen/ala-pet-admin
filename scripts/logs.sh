#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/.env}"
FOLLOW=0
ARGS=()

for arg in "$@"; do
  case "${arg}" in
    -f|--follow)
      FOLLOW=1
      ;;
    *)
      ARGS+=("${arg}")
      ;;
  esac
done

cd "${ROOT_DIR}"

compose_cmd=(docker compose)
if [[ -f "${ENV_FILE}" ]]; then
  compose_cmd+=(--env-file "${ENV_FILE}")
fi

if [[ "${FOLLOW}" -eq 1 ]]; then
  "${compose_cmd[@]}" logs -f --tail=200 "${ARGS[@]}"
  exit 0
fi

"${compose_cmd[@]}" logs --tail=200 "${ARGS[@]}"
