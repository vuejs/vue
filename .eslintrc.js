module.exports = {
  root: true,
  extends: 'standard',
  'rules': {
    'arrow-parens': [2, 'as-needed'],
    'no-new-func': 0,
    'no-new': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'standard/object-curly-even-spacing': [2, 'always', {
      objectsInObjects: false
    }],
    'standard/array-bracket-even-spacing': [2, 'never']
  }
}
