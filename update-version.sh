#!/usr/bin/env bash
set -euo pipefail

ver=$(git describe --abbrev=0)
completeVer=$(git describe)

branch_ini=${CI_COMMIT_BRANCH:-${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME:-${CI_COMMIT_TAG:+tag_trigger}}}
branch=${branch_ini:-other_trigger}

commit=$(git rev-parse HEAD)
commitShort=$(git rev-parse --short HEAD)
timestamp=$(git log -1 --date=short --pretty=format:%cd)
pipeline_id=${CI_PIPELINE_ID:-unknown_pipeline_id}

cat > server/version.js << EOF
VERSION = {
	basic: '$ver',
	complete: '$completeVer',
	branch: '$branch',
	commit: '$commit',
	commitShort: '$commitShort',
	commitDate: '$timestamp',
};
EOF

echo "✔ server/version.js updated: $completeVer ($branch)"


IMAGE_TAG="${ver}_${branch}_${commitShort}_${pipeline_id}"
CLEANED_TAG=$(echo "$IMAGE_TAG" | sed 's/[^a-zA-Z0-9._-]/-/g')
echo "IMAGE_TAG=$CLEANED_TAG" >> build.env

echo "✔ Image tag: $IMAGE_TAG"