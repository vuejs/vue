set -e

if [[ -z $1 ]]; then
  echo "Enter new version: "
  read VERSION
else
  VERSION=$1
fi

read -p "Releasing $VERSION - are you sure? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing $VERSION ..."

  npm run lint
  npm run flow
  npm run test:cover
  npm run test:e2e
  npm run test:ssr

  if [[ -z $SKIP_SAUCE ]]; then
    export SAUCE_BUILD_ID=$VERSION:`date +"%s"`
    npm run test:sauce
  fi

  # build
  VERSION=$VERSION npm run build

  # update packages
  cd packages/vue-template-compiler
  npm version $VERSION
  npm publish
  cd -

  cd packages/vue-server-renderer
  npm version $VERSION
  npm publish
  cd -

  # commit
  git add -A
  git commit -m "[build] $VERSION"
  npm version $VERSION --message "[release] $VERSION"

  # publish
  git push origin refs/tags/v$VERSION
  git push
  npm publish
fi
