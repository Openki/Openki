module.exports = {
	env: {
		browser: true,
		es6: true,
		jquery: true,
		meteor: true,
		mocha: true,
		node: true,
	},
	extends: [
		'airbnb-base',
	],
	globals: {
		L: 'readonly',
		Log: 'writable',
		minuteTime: 'writable',
		moment: 'readonly',
		msgfmt: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	rules: {
		'import/no-absolute-path': ['error', { esmodule: false }],
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
		indent: ['error', 'tab'],
		'no-tabs': ['error', { allowIndentationTabs: true }],
		'object-shorthand': ['error', 'always'],
		'prefer-destructuring': ['error', { object: false, array: false }],
		'no-multiple-empty-lines': ['error', { max: 2 }],
		'no-extra-parens': ['error'],

		// disabled rules
		'func-names': [0],
		'no-underscore-dangle': [0],
		'max-classes-per-file': [0],
	},
	settings: {
		'import/resolver': 'meteor',
	},
};
