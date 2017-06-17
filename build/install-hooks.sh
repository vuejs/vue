#!/usr/bin/env bash

if test -e .git/hooks; then
  ln -sf ../../build/git-hooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
  ln -sf ../../build/git-hooks/commit-msg .git/hooks/commit-msg && chmod +x .git/hooks/commit-msg
fi
