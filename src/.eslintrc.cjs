module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: { presets: ['@babel/preset-react'] },
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    /* React 17+ JSX transform — no need to import React */
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    /* Hooks rules — keep strict */
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    /* Noise reduction — these produce false positives in this codebase */
    'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'no-undef': 'warn',
    'no-console': 'off',
  },
  ignorePatterns: [
    /* Experimental / unstable — excluded from lint surface */
    'src/components/dripsync/',
    'src/components/dripsync2/',
    'src/components/studio/',
    'src/components/asset-loader/',
    'src/components/marketplace/',
    'src/components/multiplayer/',
    'src/components/streaming/',
    'src/components/nft/',
    'src/components/society/',
    'src/components/assistant/',
    'src/components/utils/OptimizedScene3D.jsx',
    'src/components/utils/glbValidator.js',
    'src/components/utils/rpmAnimationLibrary.js',
    'src/components/utils/rpmHelpers.js',
    'src/components/utils/assetTracker.js',
    'src/components/home/Scene3D.jsx',
    'src/components/home/StudioViewport.jsx',
    'src/components/home/DripSyncPreview.jsx',
    'src/components/home/DripSyncPreviewViewport.jsx',
    /* Backend Deno functions — different runtime */
    'src/functions/',
    /* Build output */
    'dist/',
    'node_modules/',
  ],
};