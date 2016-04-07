# get versions
PLAIN_VERSION=`npm version | grep vue | sed -e 's/[^0-9.]//g'`
CSP_VERSION=$PLAIN_VERSION-csp

# update package.json
sed -i '' -e 's/\("version"\: "[0-9]*\.[0-9]*\.[0-9]*\)"/\1-csp"/' package.json

# test + build
npm test

# push to csp branch on github
git add -A .
git commit -m "[build] $CSP_VERSION"
git push -f

# push tag
git tag v$CSP_VERSION
git push origin v$CSP_VERSION

# publish to npm and update dist tags
npm publish
sleep 1
npm dist-tag add vue@$CSP_VERSION csp
npm dist-tag add vue@$PLAIN_VERSION latest
sleep 1
npm view vue version dist-tags
