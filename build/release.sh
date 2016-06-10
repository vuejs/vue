set -e
echo "Enter release version: "
read VERSION

read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  npm test 2>/dev/null

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
  npm publish --tag next
fi
