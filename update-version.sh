#!/usr/bin/env bash
set -euo pipefail

ver=$(git describe --abbrev=0)
completeVer=$(git describe)
branch=$(git rev-parse --abbrev-ref HEAD)
commit=$(git rev-parse HEAD)
commitShort=$(git rev-parse --short HEAD)
timestamp=$(git log -1 --date=short --pretty=format:%cd)

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


IMAGE_TAG="${ver}_${branch}_${commitShort}"
echo "IMAGE_TAG=$IMAGE_TAG" >> build.env

echo "✔ Image tag: $IMAGE_TAG"