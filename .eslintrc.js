module.exports = {
	env: {
		browser: true,
		es2021: true,
		jquery: true,
		meteor: true,
		mocha: true,
		node: true,
	},
	extends: ['airbnb-base-typescript-prettier'],
	globals: {
		L: 'readonly',
		VERSION: 'writable',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'import/no-absolute-path': ['error', { esmodule: false }],
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
		'object-shorthand': ['error', 'always'],
		'prefer-destructuring': ['error', { object: false, array: false }],
		'import/no-default-export': 'error',

		// disabled rules
		'func-names': 'off',
		'no-underscore-dangle': 'off',
		'max-classes-per-file': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'import/prefer-default-export': 'off',
		// Fix some problem with js files imports ts file
		'import/no-unresolved': 'off',
		'import/extensions': 'off',

		'@typescript-eslint/no-this-alias': 'warn',
		'prettier/prettier': 'warn',
	},
	settings: {
		'import/resolver': 'meteor',
	},
};
