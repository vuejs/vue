module.exports = {
  root: true,
  extends: 'standard',
  'rules': {
    'arrow-parens': 0,
    'no-new-func': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
