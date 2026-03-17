module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: [  'airbnb-base',
'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
   "import/no-extraneous-dependencies": [
    "error", {
       "devDependencies": false,
       "optionalDependencies": false,
       "peerDependencies": false,
       "packageDir": __dirname
    }
],
    'import/prefer-default-export':"off",
    '@typescript-eslint/no-shadow': "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/dot-notation": "off",
    "no-plusplus": "off",
    "no-param-reassign": [2, { "props": false }],
    "@typescript-eslint/no-redeclare":"warn",
    "class-methods-use-this": "off",
    "import/no-cycle":"off",
    "max-classes-per-file":"off",
    "@typescript-eslint/no-explicit-any":"warn",
    "no-restricted-syntax":"off",
    "no-continue":'off',
    "no-nested-ternary":"off",
    'no-console': [
      'error',
      {
        allow: ['error', 'info']
      }
    ],
     'import/no-absolute-path': 'error'
  },
   "overrides": [
      {
        "files": ["src/**/*service.ts"],
        "rules": {
          "@typescript-eslint/return-await": "off"
        }
      },
      {
       "files": ["src/common/constants/enums/index.ts"],
        "rules": {
          "@typescript-eslint/naming-convention": "off"
        }
      },
       {
       "files": ["src/**/*interface.ts"],
        "rules": {
          "@typescript-eslint/no-redeclare": "off"
        }
      }
    ]
};