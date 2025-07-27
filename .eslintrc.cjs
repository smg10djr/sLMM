/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-prettier'],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-component-names': 'off',
        'vue/component-tags-order': [
            'error',
            {
                order: ['script', 'template', 'style']
            }
        ],
        // 물류시스템 개발을 위한 추가 규칙
        'vue/no-side-effects-in-computed-properties': 'error',
        'vue/no-mutating-props': 'error',
        'vue/require-default-prop': 'warn',
        'vue/require-prop-types': 'warn',
        'vue/no-unused-vars': 'error',
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': 'error',
        'prefer-const': 'error',
        'no-var': 'error'
    }
};
