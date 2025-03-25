#!/usr/bin/sh
git -c "user.name=github-actions[bot]" -c "user.email=41898282+github-actions[bot]@users.noreply.github.com" commit -m "Update $LIBRARY results"
