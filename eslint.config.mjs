// @ts-nocheck
import pluginJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
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
          extensions: ['.js', '.jsx'],
        },
      },
    },
  },
  // use with prettier
  eslintPluginPrettierRecommended,
];
