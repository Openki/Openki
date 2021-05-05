module.exports = {
	env: {
		browser: true,
		es2021: true,
		jquery: true,
		meteor: true,
		mocha: true,
		node: true,
	},
	extends: ['airbnb-base', 'prettier'],
	globals: {
		L: 'readonly',
		Log: 'writable',
		moment: 'readonly',
		msgfmt: 'readonly',
		VERSION: 'writable',
	},
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['prettier'],
	rules: {
		'import/no-absolute-path': ['error', { esmodule: false }],
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
		'object-shorthand': ['error', 'always'],
		'prefer-destructuring': ['error', { object: false, array: false }],

		// disabled rules
		'func-names': 'off',
		'no-underscore-dangle': 'off',
		'max-classes-per-file': 'off',

		'prettier/prettier': 'warn',
	},
	settings: {
		'import/resolver': 'meteor',
	},
};
