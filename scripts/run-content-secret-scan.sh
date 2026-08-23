#!/usr/bin/env bash

set -u

scanner_version="8.24.3"
scanner_sha256="9991e0b2903da4c8f6122b5c3186448b927a5da4deef1fe45271c3793f4ee29c"
scan_temp="$(mktemp -d)"
archive="${scan_temp}/gitleaks.tar.gz"
binary_directory="${scan_temp}/bin"
staging_directory="${scan_temp}/staged-input"
scope_proof="${scan_temp}/scope-proof.txt"
raw_report="${scan_temp}/gitleaks-results.sarif"
exit_code_path="${scan_temp}/exit-code.txt"
empty_ignore="${scan_temp}/empty-ignore"
install_outcome="failure"
scan_outcome="failure"
scan_exit_code=93

cleanup() {
  rm -rf -- "${scan_temp}"
}
trap cleanup EXIT

mkdir -p "${binary_directory}" "${empty_ignore}"
if curl --fail --location --silent --show-error \
    --proto '=https' --tlsv1.2 \
    --output "${archive}" \
    "https://github.com/gitleaks/gitleaks/releases/download/v${scanner_version}/gitleaks_${scanner_version}_linux_x64.tar.gz" && \
  printf '%s  %s\n' "${scanner_sha256}" "${archive}" \
    | sha256sum --check --strict >/dev/null && \
  tar --extract --gzip --file "${archive}" \
    --directory "${binary_directory}" gitleaks && \
  test "$("${binary_directory}/gitleaks" version)" = "${scanner_version}"; then
  install_outcome="success"
fi

if [ "${install_outcome}" = "success" ]; then
  if [ -e .gitleaks.toml ] || [ -e .gitleaksignore ] || \
     [ -n "${GITLEAKS_CONFIG:-}" ] || \
     [ -n "${GITLEAKS_CONFIG_TOML:-}" ]; then
    scan_exit_code=91
  elif node scripts/stage-content-secret-scan.mjs \
      --root "${GITHUB_WORKSPACE:-$PWD}" \
      --staging "${staging_directory}" \
      --proof "${scope_proof}" \
      "$@"; then
    set +e
    timeout --signal=TERM --kill-after=15s 300s \
      "${binary_directory}/gitleaks" dir \
        --no-banner \
        --log-level error \
        --redact=100 \
        --exit-code 2 \
        --max-archive-depth 3 \
        --max-decode-depth 2 \
        --max-target-megabytes 0 \
        --ignore-gitleaks-allow \
        --gitleaks-ignore-path "${empty_ignore}" \
        --report-format sarif \
        --report-path "${raw_report}" \
        "${staging_directory}"
    scan_exit_code="$?"
    set -e

    prohibited_count="$(sed -n 's/^prohibitedDataFindingCount=//p' \
      "${scope_proof}")"
    if [ "${scan_exit_code}" -eq 0 ] && \
       [[ "${prohibited_count}" =~ ^[1-9][0-9]*$ ]]; then
      scan_exit_code=2
    fi
  else
    scan_exit_code=92
  fi
fi

if [ "${scan_exit_code}" -eq 0 ]; then
  scan_outcome="success"
fi
printf '%s\n' "${scan_exit_code}" > "${exit_code_path}"

export GENERATED_SECRET_SCAN_INSTALL_OUTCOME="${install_outcome}"
export GENERATED_SECRET_SCAN_STEP_OUTCOME="${scan_outcome}"
export GENERATED_SECRET_SCAN_EXIT_CODE_PATH="${exit_code_path}"
export GENERATED_SECRET_SCAN_REPORT_PATH="${raw_report}"
export GENERATED_SECRET_SCAN_SCOPE_PROOF_PATH="${scope_proof}"
export GENERATED_SECRET_SCAN_STAGED_INPUT_PATH="${staging_directory}"
node scripts/write-generated-secret-scan-result.mjs

if node -e \
  'const r=JSON.parse(require("fs").readFileSync(process.env.GENERATED_SECRET_SCAN_OUTPUT_PATH,"utf8"));process.exit(r.passed===true?0:1)'; then
  exit 0
fi
exit 1
