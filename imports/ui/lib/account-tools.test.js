/* jshint -W024 */
/* jshint expr:true */

import { expect } from 'chai';
import { IsEmail } from './account-tools.js';

// This should not be here
msgfmt.init('en');

describe('Email validation', function() {
	const isEmail = str => expect(IsEmail(str)).to.be.true;
	const isNotEmail = str => expect(IsEmail(str)).to.be.false;
	const fails = notaString => expect(() => IsEmail(notaString)).to.throw();

	it("accepts normal emails", function() {
		isEmail("Jah7reix.poo0Ooz0@geemail.com");
		isEmail("poo0Ooz0@geemail.com");
		isEmail("diFoh7ma@wooow.example");
	});

	it("accepts more email formats", function() {
		isEmail("Jah7reix.poo0Ooz0@subdomain.geemail.com");
		isEmail("J@s.g.c");
		isEmail("0@sub.sub.sub.sub.sub");
	});

	it("accepts weird email formats", function() {
		isEmail("Jah7reix+poo0Ooz0@geemail.com");
		isEmail("Ó@£.cooooooom");
		isEmail("-@ä.c");
		isEmail("{_}@n-o.c");
	});

	it("rejects incomplete addresses", function() {
		// Yes it is technically possible to have an address @toplevel
		// But we still assume it's an error.
		isNotEmail("poo0Ooz0@geemail");

		isNotEmail("@£.cooooooom");
		isNotEmail("-@");
		isNotEmail("diFoh7ma@.");
		isNotEmail("diFoh7ma@.example");
		isNotEmail("diFoh7ma@example.");
	});

	it("rejects other strings", function() {
		isNotEmail("Jah7reix.poo0Ooz0geemail.com");
		isNotEmail("Jah7reix.poo0Ooz0");
		isNotEmail("poo0Ooz0");
		isNotEmail("é");
		isNotEmail("0");
		isNotEmail("");
	});

	it("fails on non-strings", function() {
		fails();
		fails(undefined);
		fails(true);
		fails(false);
		fails({});
		fails(1.1);
	});
});
