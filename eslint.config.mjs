// @ts-check
import nextConfig from 'eslint-config-next';

// Extract @typescript-eslint plugin from nextConfig so we can use it in our override
const tsPlugin = nextConfig.find(
  /** @param {import('eslint').Linter.Config} c */
  (c) => c.plugins?.['@typescript-eslint']
)?.plugins?.['@typescript-eslint'];

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Ignore generated files
  {
    ignores: ['generated/**', '.next/**', 'node_modules/**'],
  },
  ...nextConfig,
  {
    plugins: tsPlugin ? { '@typescript-eslint': tsPlugin } : {},
    rules: {
      // React specific rules
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',

      // React Compiler rules — disable false-positive patterns for standard patterns
      // (hydration mounting, controlled hooks, TanStack Table, React Hook Form watch,
      //  and inner component functions in large admin pages)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',

      // General rules for portfolio project
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      // Use TypeScript rule which correctly handles destructured props and catch variables
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default eslintConfig;
