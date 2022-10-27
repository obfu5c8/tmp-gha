module.exports = {
    root: true,

    extends: [
        'eslint:recommended',
        "plugin:prettier/recommended",
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],

    plugins: [
        '@typescript-eslint',
        'simple-import-sort',
        "prettier",
        "unused-imports",
    ],


    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        sourceType: 'module',
    },

    rules: {
        '@typescript-eslint/no-floating-promises': "off",
        "@typescript-eslint/no-explicit-any": "off",
        "simple-import-sort/imports": "warn",
        "no-console": "warn",
        "prettier/prettier": "error",
        "@typescript-eslint/no-unused-vars": "off", // unused-imports does this for us
        "unused-imports/no-unused-imports": "error",
		"unused-imports/no-unused-vars": [
			"warn",
			{ "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
		],
    }
}
