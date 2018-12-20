module.exports = {
  spec_dir: 'test/ssr',
  spec_files: [
    '*.spec.js'
  ],
  helpers: [
    require.resolve('@babel/register'),
    '../helpers/to-have-been-warned.js'
  ]
}
