module.exports = {
  semi: false,
  trailingComma: 'none',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'avoid',
  overrides: [
    {
      files: '**/*.{hbs}',
      options: {
        parser: 'glimmer'
      }
    }
  ]
}
