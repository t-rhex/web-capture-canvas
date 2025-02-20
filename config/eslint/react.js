module.exports = {
  extends: [
    './base.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  env: {
    browser: true,
    es2020: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
  },
}; 