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
		minuteTime: 'writable',
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
		'func-names': [0],
		'no-underscore-dangle': [0],
		'max-classes-per-file': [0],

		'prettier/prettier': 'error',
	},
	settings: {
		'import/resolver': 'meteor',
	},
};
