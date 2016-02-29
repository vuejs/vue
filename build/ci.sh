set -e
if [ -z "$CI_PULL_REQUEST" ]
then
  npm run lint
  npm run cover
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
  npm run build
  npm run e2e
  npm run sauce #csp only need Chrome/FF
else
  npm test
fi
