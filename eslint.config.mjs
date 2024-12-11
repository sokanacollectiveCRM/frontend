// @ts-nocheck
import pluginJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  // get rid of warning
  {
    plugins: {
      '@babel/plugin-transform-private-property-in-object': {},
    },
  },
  // react/jsx related
  pluginReact.configs.flat.recommended,
  {
    rules: {
      'react/jsx-filename-extension': [
        2,
        {
          allow: 'as-needed',
          extensions: ['.jsx'],
          ignoreFilesWithoutCode: true,
        },
      ],
    },
  },
  // imports related
  importPlugin.flatConfigs.errors,
  {
    settings: {
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.mjs', '.cjs'],
        },
      },
    },
  },
  {
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: true,
          rootDir: 'src',
        },
      ],
    },
  },
  // use with prettier
  eslintPluginPrettierRecommended,
];
