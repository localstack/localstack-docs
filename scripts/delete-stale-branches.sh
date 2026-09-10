#!/usr/bin/env bash
#
# Report on (and optionally delete) stale head branches in this repo.
#
# A branch is left alone if it is the default branch, in --protect, or the
# head of an OPEN pull request. Otherwise it is eligible once it falls into
# one of these buckets:
#   - head of a MERGED pull request: always eligible, regardless of age.
#   - head of a CLOSED (unmerged) pull request, last commit older than --days.
#   - no associated pull request at all, last commit older than --days: this
#     bucket is only ever reported, never auto-deleted, since it may be
#     someone's unpushed personal work rather than an abandoned PR branch.
#
# Usage:
#   scripts/delete-stale-branches.sh                    # dry run, 90-day threshold
#   scripts/delete-stale-branches.sh --days 30           # dry run, 30-day threshold
#   scripts/delete-stale-branches.sh --execute           # delete, asks to confirm
#   scripts/delete-stale-branches.sh --execute --yes     # delete, no prompt (CI use)
#
# Requires: gh (authenticated with repo access), jq

set -euo pipefail

OWNER="localstack"
REPO="localstack-docs"
DAYS=90
EXECUTE=false
ASSUME_YES=false
PROTECTED_BRANCHES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --days) DAYS="$2"; shift 2 ;;
    --execute) EXECUTE=true; shift ;;
    --yes) ASSUME_YES=true; shift ;;
    --owner) OWNER="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --protect) PROTECTED_BRANCHES+=("$2"); shift 2 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^#!\?/ /; s/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

command -v gh >/dev/null || { echo "gh CLI is required." >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required." >&2; exit 1; }

NOW_EPOCH=$(date +%s)
CUTOFF_EPOCH=$(( NOW_EPOCH - DAYS * 86400 ))

echo "Repository: $OWNER/$REPO"
echo "Stale threshold: $DAYS days (for closed/PR-less branches; merged-PR branches are always eligible)"
echo "Mode: $([ "$EXECUTE" = true ] && echo EXECUTE || echo "DRY RUN (pass --execute to delete)")"
echo

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

BRANCHES_FILE="$TMP_DIR/branches.jsonl"
: > "$BRANCHES_FILE"

CURSOR="null"
PAGE=0
while :; do
  PAGE=$((PAGE + 1))
  RESPONSE=$(gh api graphql -f query='
    query($owner: String!, $repo: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        defaultBranchRef { name }
        refs(refPrefix: "refs/heads/", first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            name
            target {
              ... on Commit { committedDate }
            }
            associatedPullRequests(first: 5, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes { number state url }
            }
          }
        }
      }
    }' -f owner="$OWNER" -f repo="$REPO" -f cursor="$CURSOR")

  if [[ "$PAGE" -eq 1 ]]; then
    DEFAULT_BRANCH=$(echo "$RESPONSE" | jq -r '.data.repository.defaultBranchRef.name')
    echo "Default branch: $DEFAULT_BRANCH (always protected)"
    PROTECTED_BRANCHES+=("$DEFAULT_BRANCH")
  fi

  echo "$RESPONSE" | jq -c '.data.repository.refs.nodes[]' >> "$BRANCHES_FILE"

  HAS_NEXT=$(echo "$RESPONSE" | jq -r '.data.repository.refs.pageInfo.hasNextPage')
  CURSOR=$(echo "$RESPONSE" | jq -r '.data.repository.refs.pageInfo.endCursor')
  [[ "$HAS_NEXT" == "true" ]] || break
done

TOTAL=$(wc -l < "$BRANCHES_FILE" | tr -d ' ')
echo "Fetched $TOTAL branches."
if [[ ${#PROTECTED_BRANCHES[@]} -gt 1 ]]; then
  echo "Also protected: ${PROTECTED_BRANCHES[*]:1}"
fi
echo

is_protected() {
  local name="$1"
  for p in "${PROTECTED_BRANCHES[@]}"; do
    [[ "$name" == "$p" ]] && return 0
  done
  return 1
}

# Portable "parse an ISO-8601 UTC timestamp to epoch seconds" for GNU and BSD date.
to_epoch() {
  date -d "$1" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$1" +%s
}

DELETE_LIST="$TMP_DIR/to_delete.tsv"
REVIEW_LIST="$TMP_DIR/to_review.tsv"
: > "$DELETE_LIST"
: > "$REVIEW_LIST"

while IFS= read -r LINE; do
  NAME=$(echo "$LINE" | jq -r '.name')
  is_protected "$NAME" && continue

  COMMITTED_DATE=$(echo "$LINE" | jq -r '.target.committedDate // empty')
  [[ -z "$COMMITTED_DATE" ]] && continue # non-commit ref (e.g. a tag-like head), skip

  COMMIT_EPOCH=$(to_epoch "$COMMITTED_DATE")
  AGE_DAYS=$(( (NOW_EPOCH - COMMIT_EPOCH) / 86400 ))

  PR_STATE=$(echo "$LINE" | jq -r '.associatedPullRequests.nodes[0].state // "NONE"')
  PR_NUMBER=$(echo "$LINE" | jq -r '.associatedPullRequests.nodes[0].number // "-"')
  PR_URL=$(echo "$LINE" | jq -r '.associatedPullRequests.nodes[0].url // "-"')

  # Never touch a branch that's the head of a currently open PR.
  [[ "$PR_STATE" == "OPEN" ]] && continue

  if [[ "$PR_STATE" == "MERGED" ]]; then
    printf '%s\tmerged PR #%s (%s), last commit %dd ago\n' "$NAME" "$PR_NUMBER" "$PR_URL" "$AGE_DAYS" >> "$DELETE_LIST"
  elif [[ "$COMMIT_EPOCH" -lt "$CUTOFF_EPOCH" ]]; then
    if [[ "$PR_STATE" == "CLOSED" ]]; then
      printf '%s\tclosed unmerged PR #%s (%s), last commit %dd ago\n' "$NAME" "$PR_NUMBER" "$PR_URL" "$AGE_DAYS" >> "$DELETE_LIST"
    else
      printf '%s\tno associated PR, last commit %dd ago\n' "$NAME" "$AGE_DAYS" >> "$REVIEW_LIST"
    fi
  fi
done < "$BRANCHES_FILE"

DELETE_COUNT=$(wc -l < "$DELETE_LIST" | tr -d ' ')
REVIEW_COUNT=$(wc -l < "$REVIEW_LIST" | tr -d ' ')

echo "== Eligible for deletion (merged, or closed+unmerged older than ${DAYS}d): $DELETE_COUNT =="
if [[ "$DELETE_COUNT" -gt 0 ]]; then
  column -t -s $'\t' "$DELETE_LIST"
fi
echo
echo "== No associated PR, older than ${DAYS}d -- reported only, never auto-deleted: $REVIEW_COUNT =="
if [[ "$REVIEW_COUNT" -gt 0 ]]; then
  column -t -s $'\t' "$REVIEW_LIST"
fi
echo

if [[ "$DELETE_COUNT" -eq 0 ]]; then
  echo "Nothing to delete."
  exit 0
fi

if [[ "$EXECUTE" != true ]]; then
  echo "Dry run only. Re-run with --execute to delete the $DELETE_COUNT branch(es) above."
  exit 0
fi

if [[ "$ASSUME_YES" != true ]]; then
  read -r -p "Delete $DELETE_COUNT branch(es) from $OWNER/$REPO? Type 'delete' to confirm: " CONFIRM
  [[ "$CONFIRM" == "delete" ]] || { echo "Aborted, nothing was deleted."; exit 1; }
fi

FAILED=0
while IFS=$'\t' read -r NAME _; do
  if gh api -X DELETE "repos/$OWNER/$REPO/git/refs/heads/$NAME" >/dev/null 2>"$TMP_DIR/err"; then
    echo "deleted: $NAME"
  else
    echo "FAILED: $NAME ($(cat "$TMP_DIR/err"))" >&2
    FAILED=$((FAILED + 1))
  fi
  sleep 0.2
done < "$DELETE_LIST"

echo
echo "Done. $((DELETE_COUNT - FAILED))/$DELETE_COUNT branches deleted."
[[ "$FAILED" -eq 0 ]] || exit 1
