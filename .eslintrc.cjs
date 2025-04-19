/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['airbnb-base'],
  plugins: [
    'unused-imports',
    'import',
    '@typescript-eslint',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2021: true,
  },
  ignorePatterns: [
    '**/*.config.js',
    '**/*.config.ts',
    '**/*.json',
    '**/.eslintcache',
    'node_modules/',
    'dist/',
    '.turbo/',
    '.idea/',
    '.vscode/',
    '.git/',
  ],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'semi',
              requireLast: true,
            },
            singleline: {
              delimiter: 'semi',
              requireLast: true,
            },
          },
        ],
        'no-unused-vars': 'off',
        'no-shadow': 'off',
        'no-console': 'warn',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-cycle': ['error', { ignoreExternal: true }],
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
        'object-curly-spacing': ['error', 'always'],
        indent: ['error', 2],
        semi: ['error', 'always'],
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
        'object-curly-newline': [
          'error',
          {
            ObjectExpression: {
              minProperties: 4,
              multiline: true,
              consistent: true,
            },
            ObjectPattern: {
              minProperties: 4,
              multiline: true,
              consistent: true,
            },
            ImportDeclaration: {
              multiline: true,
              consistent: true,
            },
            ExportDeclaration: {
              minProperties: 4,
              multiline: true,
              consistent: true,
            },
          },
        ],
        'padding-line-between-statements': [
          'error',
          {
            blankLine: 'always',
            prev: '*',
            next: 'return',
          },
        ],
        'object-property-newline': [
          'error',
          {
            allowAllPropertiesOnSameLine: false,
            allowMultiplePropertiesPerLine: false,
          },
        ],
        'comma-dangle': [
          'error',
          {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
          },
        ],
        'max-len': [
          'error',
          {
            code: 180,
            tabWidth: 2,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
          },
        ],
      },
    },
  ],
};