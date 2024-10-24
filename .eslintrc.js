module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '*.css',
            patternOptions: {
              dot: true,
              nocomment: true,
              matchBase: true,
            },
            group: 'sibling',
            position: 'after',
          },
          {
            pattern: '*.svg',
            patternOptions: {
              dot: true,
              nocomment: true,
              matchBase: true,
            },
            group: 'sibling',
            position: 'after',
          },
          {
            pattern: '*.png',
            patternOptions: {
              dot: true,
              nocomment: true,
              matchBase: true,
            },
            group: 'sibling',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        trailingComma: 'es5',
        semi: true,
        jsxSingleQuote: false,
        singleQuote: true,
        endOfLine: 'auto',
        tabWidth: 2,
      },
    ],
  },
};
