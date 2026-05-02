#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="$(basename "${ROOT_DIR}")"
TIMESTAMP="${EXPORT_TIMESTAMP:-$(date +"%Y%m%d-%H%M%S")}"
OUTPUT_DIR="${1:-${ROOT_DIR}/exports}"
ARCHIVE_PATH="${OUTPUT_DIR}/${PROJECT_NAME}-${TIMESTAMP}.tar.gz"

mkdir -p "${OUTPUT_DIR}"

COPYFILE_DISABLE=1 tar \
  --exclude='./.git' \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./coverage' \
  --exclude='./dist' \
  --exclude='./build' \
  --exclude='./.venv' \
  --exclude='./venv' \
  --exclude='./env' \
  --exclude='./__pycache__' \
  --exclude='./**/__pycache__' \
  --exclude='./*.log' \
  --exclude='./**/*.log' \
  --exclude='./.env' \
  --exclude='./.env.*' \
  --exclude='./config/*.local.yaml' \
  --exclude='./storage' \
  --exclude='./storage/**' \
  --exclude='./exports' \
  --exclude='./.DS_Store' \
  -czf "${ARCHIVE_PATH}" \
  -C "${ROOT_DIR}" \
  .

echo "exported ${PROJECT_NAME} code to ${ARCHIVE_PATH}"