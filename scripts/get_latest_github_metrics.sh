#!/bin/bash
set -euo pipefail

# input params
PARENT_FOLDER=${1:-target}
METRICS_ARTIFACTS_BRANCH=${2:-main}

# env vars
REPOSITORY_NAME=${REPOSITORY_NAME:-localstack-pro}
ARTIFACT_ID=${ARTIFACT_ID:-implemented_features_python-amd64.csv}
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

RUN_IDS=$(gh run list --limit "$LIMIT" --branch "$METRICS_ARTIFACTS_BRANCH" --repo "$REPOSITORY_OWNER/$REPOSITORY_NAME" --workflow "$WORKFLOW" --json databaseId,conclusion,status --jq "$SELECTOR")

if [ "$(echo "$RUN_IDS" | jq -rs '.[0].databaseId')" = "null" ]; then
  echo "No matching workflow run found."
  exit 1
fi

for ((i=0; i<LIMIT; i++)); do
  RUN_ID=$(echo "$RUN_IDS" | jq -rs ".[$i].databaseId")
  echo "Trying run id: $RUN_ID"

  gh run download "$RUN_ID" --repo "$REPOSITORY_OWNER/$REPOSITORY_NAME" -p "$ARTIFACT_ID" -D "$TMP_FOLDER" || true

  if [ "$(ls -1 "$TMP_FOLDER" 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "Downloaded artifact successfully."
    break
  fi
done

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
