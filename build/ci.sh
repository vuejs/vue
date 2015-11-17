if [ -z "$CI_PULL_REQUEST" ]
then
  npm run lint &&\
  npm run cover &&\
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
  npm run build &&\
  npm run e2e &&\
  npm run sauce-all
else
  npm run lint &&\
  npm run cover &&\
  npm run build &&\
  npm run e2e
fi
