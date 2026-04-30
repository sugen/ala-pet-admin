#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="ala-pet-admin"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/.env}"
FORCE=0

log() {
  printf '[%s] %s\n' "${PROJECT_NAME}" "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy.sh [--force]

Options:
  --force   Force rebuild and restart even when git HEAD is unchanged.
EOF
}

while (($# > 0)); do
  case "$1" in
    --force)
      FORCE=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
  shift
done

command -v git >/dev/null 2>&1 || die "git is required"
command -v docker >/dev/null 2>&1 || die "docker is required"
docker compose version >/dev/null 2>&1 || die "docker compose is required"
[[ -f "${ENV_FILE}" ]] || die "missing env file: ${ENV_FILE}; copy .env.example to .env first"

cd "${ROOT_DIR}"

if [[ -n "$(git status --porcelain)" ]]; then
  die "working tree is dirty; commit or stash changes before deploy"
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
old_head="$(git rev-parse HEAD)"

log "fetching latest code from origin/${current_branch}"
git fetch --prune origin
git pull --ff-only origin "${current_branch}"

new_head="$(git rev-parse HEAD)"
compose_cmd=(docker compose --env-file "${ENV_FILE}")

if [[ "${FORCE}" -eq 0 && "${old_head}" == "${new_head}" ]]; then
  log "no git changes detected; skipping rebuild and restart"
  "${ROOT_DIR}/scripts/healthcheck.sh"
  log "deploy finished without restart"
  exit 0
fi

if [[ "${FORCE}" -eq 1 ]]; then
  log "force mode enabled; rebuilding current project"
else
  log "code changed: ${old_head} -> ${new_head}"
fi

"${compose_cmd[@]}" build
"${compose_cmd[@]}" up -d

"${ROOT_DIR}/scripts/healthcheck.sh"
log "deploy finished successfully"
