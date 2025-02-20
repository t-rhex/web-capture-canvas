module.exports = {
    extends: ['../../config/eslint/base.js'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
        },
    },
}; 