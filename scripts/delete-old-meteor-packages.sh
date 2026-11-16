#!/usr/bin/env bash

set -euo pipefail

# After confirmation, remove all cached Meteor packages except the most recent version.
# This is useful to run after Meteor version upgrades to save disk space.
# Based on: https://qnipp.com/en/2016/02/meteor-packages-cleaning-the-package-cache/

LOG_FILE=/tmp/meteor-packages-to-delete.txt

{
  # 1) List what will be removed and save to a LOG_FILE so it can be reviewed in a text editor.
  # This sorts version numbers and only keeps the newest version (highest number).
  # It assumes that packages include their version number in the directory name
  cd ~/.meteor/packages; for i in * ; do pushd $i > /dev/null; ls | sort -V | head -n-1 | while read v ; do ls -R $v .$v* >> $LOG_FILE ; done ; popd ; done
} &>/dev/null

# Only proceed it there are packages that should be deleted
[ -s $LOG_FILE ] || printf "\nAlready cleaned. No old packages to delete.\n\n" && exit 0

echo ""
echo "Warning: This will delete all cached meteor packages from older Meteor versions."
echo ""
echo "Before you continue, please review carefully what will be deleted in the log $LOG_FILE:"
echo "Check with your editor: nano $LOG_FILE"
echo ""

# 2) Prompt for confirmation since this is a destructive operation
read -p "Are you sure you want to delete old Meteor packages? (y/N) "
echo ""
if [[ $REPLY =~ ^[y]$ ]]; then
  # 3) Delete the same files that were listed in the logfile.
  cd ~/.meteor/packages &>/dev/null; for i in * ; do pushd $i > /dev/null; ls | sort -V | head -n-1 | while read v ; do rm -rf $v .$v* ; done ; popd ; done

  echo ""
  echo "Meteor cleanup completed"
else
  echo "Aborting..."
fi

echo ""
