#!/bin/bash
set -euo pipefail

# input params
PARENT_FOLDER=${1:-target}
METRICS_ARTIFACTS_BRANCH=${2:-main}

# env vars
REPOSITORY_NAME=${REPOSITORY_NAME:-localstack-pro}
ARTIFACT_ID=${ARTIFACT_ID:-implemented_features_python-amd64}
WORKFLOW=${WORKFLOW:-"Az / Build, Test, Push"}
PREFIX_ARTIFACT=${PREFIX_ARTIFACT:-}
FILTER_SUCCESS=${FILTER_SUCCESS:-1}
LIMIT=${LIMIT:-20}

RESOURCE_FOLDER=${RESOURCE_FOLDER:-}
REPOSITORY_OWNER=${REPOSITORY_OWNER:-localstack}
TARGET_FOLDER="$PARENT_FOLDER/$RESOURCE_FOLDER"

TMP_FOLDER="$PARENT_FOLDER/tmp_download"
mkdir -p "$TMP_FOLDER"

echo "Searching for artifact '$ARTIFACT_ID' in workflow '$WORKFLOW' on branch '$METRICS_ARTIFACTS_BRANCH' in repo '$REPOSITORY_OWNER/$REPOSITORY_NAME'."

if [ "$FILTER_SUCCESS" = "1" ]; then
  echo "Filtering runs by conclusion=success"
  SELECTOR='.[] | select(.conclusion=="success")'
else
  echo "Filtering runs by completed status (success/failure)"
  SELECTOR='.[] | select(.status=="completed" and (.conclusion=="failure" or .conclusion=="success"))'
fi

RUN_IDS=()
while IFS= read -r run_id; do
  RUN_IDS+=("$run_id")
done < <(
  gh run list \
    --limit "$LIMIT" \
    --branch "$METRICS_ARTIFACTS_BRANCH" \
    --repo "$REPOSITORY_OWNER/$REPOSITORY_NAME" \
    --workflow "$WORKFLOW" \
    --json databaseId,conclusion,status \
    --jq "$SELECTOR | .databaseId"
)

if [ "${#RUN_IDS[@]}" -eq 0 ]; then
  echo "No matching workflow runs found."
  exit 1
fi

for RUN_ID in "${RUN_IDS[@]}"; do
  if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
    continue
  fi
  echo "Trying run id: $RUN_ID"

  gh run download "$RUN_ID" --repo "$REPOSITORY_OWNER/$REPOSITORY_NAME" -p "$ARTIFACT_ID" -D "$TMP_FOLDER" || true

  if [ "$(ls -1 "$TMP_FOLDER" 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "Downloaded artifact successfully."
    break
  fi
done

if [ "$(ls -1 "$TMP_FOLDER" 2>/dev/null | wc -l)" -eq 0 ]; then
  echo "Failed to download artifact '$ARTIFACT_ID' from the checked workflow runs."
  exit 1
fi

echo "Moving artifact to $TARGET_FOLDER"
mkdir -p "$TARGET_FOLDER"
if [[ -z "${PREFIX_ARTIFACT}" ]]; then
  cp -R "$TMP_FOLDER"/. "$TARGET_FOLDER"/
else
  while IFS= read -r file; do
    org_file_name=$(echo "$file" | sed "s/.*\///")
    mv -- "$file" "$TARGET_FOLDER/$PREFIX_ARTIFACT-$org_file_name"
  done < <(find "$TMP_FOLDER" -type f -name "*.csv")
fi

rm -rf "$TMP_FOLDER"
echo "Contents of $TARGET_FOLDER:"
ls -la "$TARGET_FOLDER"
