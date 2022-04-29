module.exports = {
  spec_dir: 'test/weex',
  spec_files: [
    '**/*[sS]pec.js'
  ],
  helpers: [
    require.resolve('@babel/register')
  ]
}
