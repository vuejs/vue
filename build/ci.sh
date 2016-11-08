set -e
npm run lint
npm run flow
npm run test:types
npm run test:cover
npm run test:e2e -- --env phantomjs
npm run test:ssr
npm run test:weex

# report coverage stats for non-PRs
if [[ -z $CI_PULL_REQUEST ]]; then
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
fi

# run full browser suites on saucelabs for master branch
if [[ $CIRCLE_BRANCH = master ]]; then
  npm run test:sauce
fi
