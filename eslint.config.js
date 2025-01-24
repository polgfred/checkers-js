const eslint = require('@eslint/js');
const tsPlugin = require('typescript-eslint')
const importPlugin = require('eslint-plugin-import');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
    eslint.configs.recommended,
    ...tsPlugin.configs.recommended,
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],

        plugins: {
            import: importPlugin,
            typescript: tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parser: tsPlugin.parser,
            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.ts', '.tsx'],
                },
            },

            react: {
                version: 'detect',
            },
        },

        rules: {
            'no-console': 'warn',

            'import/no-unresolved': 'error',
            'import/order': [
                'warn',
                {
                    'newlines-between': 'always',

                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],

            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            'react/jsx-no-undef': 'error',
            'react/jsx-no-target-blank': 'error',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],

        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];
