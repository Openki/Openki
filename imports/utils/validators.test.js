/* jshint -W024 */
/* jshint expr:true */

import { expect } from 'chai';
import { IsUrl, IsFiletype } from './validators.js';

// This should not be here
msgfmt.init('en');

describe('URL validation', function() {
	const isUrl = str => expect(IsUrl(str)).to.be.true;
	const isNotUrl = str => expect(IsUrl(str)).to.be.false;
	const fails = notaString => expect(() => IsUrl(notaString)).to.throw();

	it("accepts normal emails", function() {
		isUrl("Jah7reix.poo0Ooz0@geUrl.com");
		isUrl("poo0Ooz0@geemail.com");
		isUrl("diFoh7ma@wooow.example");
	});

	it("accepts more url formats", function() {
		isUrl("Jah7reix.poo0Ooz0@subdomain.geemail.com");
		isUrl("J@s.g.c");
		isUrl("0@sub.sub.sub.sub.sub");
	});

	it("accepts weird url formats", function() {
		isUrl("Jah7reix+poo0Ooz0@geemail.com");
		isUrl("Ó@£.cooooooom");
		isUrl("-@ä.c");
		isUrl("{_}@n-o.c");
	});

	it("rejects incomplete urls", function() {
		// Yes it is technically possible to have an address @toplevel
		// But we still assume it's an error.
		isNotUrl("poo0Ooz0@geemail");

		isNotUrl("@£.cooooooom");
		isNotUrl("-@");
		isNotUrl("diFoh7ma@.");
		isNotUrl("diFoh7ma@.example");
		isNotUrl("diFoh7ma@example.");
	});

	it("rejects other strings", function() {
		isNotUrl("Jah7reix.poo0Ooz0geemail.com");
		isNotUrl("Jah7reix.poo0Ooz0");
		isNotUrl("poo0Ooz0");
		isNotUrl("é");
		isNotUrl("0");
		isNotUrl("");
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

describe('Filetype validation', function() {
	const isFiletype = str => expect(IsFiletype(str, ['png'])).to.be.true;
	const isNotFiletype = str => expect(IsFiletype(str, ['png'])).to.be.false;
	const fails = notaString => expect(() => IsFiletype(notaString, ['png'])).to.throw();

	it("accepts normal emails", function() {
		isFiletype("Jah7reix.poo0Ooz0@geFiletype.com");
		isFiletype("poo0Ooz0@geemail.com");
		isFiletype("diFoh7ma@wooow.example");
	});

	it("accepts more url formats", function() {
		isFiletype("Jah7reix.poo0Ooz0@subdomain.geemail.com");
		isFiletype("J@s.g.c");
		isFiletype("0@sub.sub.sub.sub.sub");
	});

	it("accepts weird url formats", function() {
		isFiletype("Jah7reix+poo0Ooz0@geemail.com");
		isFiletype("Ó@£.cooooooom");
		isFiletype("-@ä.c");
		isFiletype("{_}@n-o.c");
	});

	it("rejects incomplete urls", function() {
		// Yes it is technically possible to have an address @toplevel
		// But we still assume it's an error.
		isNotFiletype("poo0Ooz0@geemail");

		isNotFiletype("@£.cooooooom");
		isNotFiletype("-@");
		isNotFiletype("diFoh7ma@.");
		isNotFiletype("diFoh7ma@.example");
		isNotFiletype("diFoh7ma@example.");
	});

	it("rejects other strings", function() {
		isNotFiletype("Jah7reix.poo0Ooz0geemail.com");
		isNotFiletype("Jah7reix.poo0Ooz0");
		isNotFiletype("poo0Ooz0");
		isNotFiletype("é");
		isNotFiletype("0");
		isNotFiletype("");
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