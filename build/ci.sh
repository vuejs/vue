set -e
npm run ci
if [ -z "$CI_PULL_REQUEST" ] then
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
fi
