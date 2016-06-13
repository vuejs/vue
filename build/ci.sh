set -e
npm run lint
npm run flow
npm run test:cover
npm run test:e2e -- --env phantomjs
npm run test:ssr
if [ -z "$CI_PULL_REQUEST" ]; then
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
  npm run test:sauce
fi
