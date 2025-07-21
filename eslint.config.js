// eslint.config.js or eslint.config.mjs
// @ts-nocheck
import pluginJs from '@eslint/js';
import pluginTs from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import prettierPlugin from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      'vite.config.ts',
      'vitest.config.ts',
      'postcss.config.cjs',
      'tailwind.config.cjs',
      'components.json',
      '.prettierrc.cjs',
      'eslint.config.js',
      'package.json',
      'package-lock.json',
      'tsconfig*.json',
      'vercel.json',
      '.env*',
      '.gitignore',
      '.gitattributes',
      'README.md',
      'todo.md',
      'backend-update-requirements.md',
      'src/features/request/README.md',
      'src/features/request/TESTING.md',
      'src/features/billing/README.md',
      'src/features/payments/README.md',
      'src/features/request/__tests__/**',
      'src/api/__tests__/**',
      'src/test/**',
      'src/vite-env.d.ts',
      'vite-env.d.ts',
      'src/features/auth/EmailVerification.jsx',
      'src/features/auth/GoogleButton.jsx',
      'src/features/dashboard-home/Home.jsx',
      'src/features/not-found/NotFound.jsx',
    ],
  },
  pluginJs.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
    },
    rules: {
      ...pluginTs.configs.recommended.rules,
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginReactRefresh.configs.recommended.rules,
      'react/jsx-filename-extension': 'off',
      'react/jsx-quotes': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'no-undef': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      import: importPlugin,
      'no-relative-import-paths': noRelativeImportPaths,
      prettier: prettierPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: 'src' },
      ],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          jsxSingleQuote: true,
        }
      ],
      'quotes': 'off',
    },
  },
];