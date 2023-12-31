/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        "semi": "off",
        "@typescript-eslint/semi": "error",
        "@typescript-eslint/no-explicit-any": "off"
    },
};