#!/usr/bin/sh
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git config user.name "github-actions[bot]"
git config pull.rebase true
git add src/ out/ -A
git commit -m "Update $LIBRARY results"
git pull origin master
git push origin master
