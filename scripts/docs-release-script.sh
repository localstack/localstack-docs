base_ref="main"
ref_name="not-docs-123"

# If it's merging into main, it MUST be a feature branch

# If it's merging into something other than main, then it needs to be the feature branch
if [[ $base_ref == aws-docs-* || $base_ref == snowflake-docs-* ]]; then
    echo "Merging to a feature branch, all good!"
    exit 0
fi

if [[ $base_ref == 'main' && ($ref_name == aws-docs-* || $ref_name == snowflake-docs-*) ]]; then
    echo "All good, it's a valid branch to merge to main"
    exit 0
fi


echo "All PRs need to be merged into main or a feature branch"
exit 1