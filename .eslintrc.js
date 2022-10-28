module.exports = {
    root: true,
    env: {
        node: true,
        commonjs: true,
        es6: true,
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],

    plugins: ['simple-import-sort', 'prettier', 'unused-imports'],

    rules: {
        'simple-import-sort/imports': 'warn',
        'no-console': 'warn',
        'prettier/prettier': 'error',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
        ],
    },

    overrides: [
        {
            files: ['**/*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ['./tsconfig.json'],
                sourceType: 'module',
            },
            extends: [
                'eslint:recommended',
                'plugin:prettier/recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
            ],

            plugins: ['@typescript-eslint', 'simple-import-sort', 'prettier', 'unused-imports'],

            rules: {
                '@typescript-eslint/no-floating-promises': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unused-vars': 'off', // unused-imports does this for us
            },
        },
    ],
};
