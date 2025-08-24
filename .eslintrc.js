module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended', // if using TypeScript
    'react-app',
  ],
  parser: '@typescript-eslint/parser', // if using TypeScript, otherwise remove this line
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint', // if using TypeScript
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
  },
  rules: {
    // Add any custom rules here
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // If using TypeScript
  },
};