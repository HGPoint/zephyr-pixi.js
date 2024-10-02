module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint', 'import', 'unused-imports'],
    rules: {
        'no-console': ['off'],
        'no-constant-condition': ['off'],
        'no-unused-vars': ['warn', {args: 'none'}],
        'no-var': ['warn'],
        camelcase: ['warn', {properties: 'never'}],
        'no-debugger': ['warn'],
        'prefer-const': ['warn'],
        'one-var': ['warn', {initialized: 'never'}],
        'no-case-declarations': ['off'],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/ban-ts-comment': [
            'error',
            {
                'ts-ignore': false, // Разрешает использование @ts-ignore
                'ts-expect-error': false,
                'ts-nocheck': true,
                'ts-check': false,
            },
        ],
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
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                    'object',
                    'type',
                ],
                pathGroups: [
                    {
                        pattern: '@/**',
                        group: 'internal',
                    },
                ],
                pathGroupsExcludedImportTypes: ['builtin'],
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                'newlines-between': 'always',
            },
        ],
    },
};
