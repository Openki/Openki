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

	it("accepts normal urls", function() {
		isUrl("google.com");
		isUrl("www.google.com");
		isUrl("wooow.example");
	});

	it("accepts more url formats", function() {
		isUrl("www.subdomain.geemail.com");
		isUrl("www.s.g.c");
		isUrl("www.sub.sub.sub.sub.sub");
	});

	it("rejects incomplete urls", function() {
		// Yes it is technically possible to have an address @toplevel
		// But we still assume it's an error.
		isNotUrl("geemail");
		isNotUrl("cooooooom");
		isNotUrl("example.");
		isNotUrl(".example.");

	});

	it("rejects other strings", function() {
		isNotUrl("Jah7reix.poo0Ooz0geemail.com");
		isNotUrl("abc/123.com")
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
	const isFiletype = str => expect(IsFiletype(str, ['png', 'pdf'])).to.be.true;
	const isNotFiletype = str => expect(IsFiletype(str, ['png', 'pdf'])).to.be.false;
	const fails = notaString => expect(() => IsFiletype(notaString, ['png', 'pdf'])).to.throw();

	it("accepts filetypes", function() {
		isFiletype("horse.png");
		isFiletype("cat.png");
		isFiletype("kakadu.png");
		isFiletype('invoice.pdf');
		isFiletype('invoice.pdf.png');
	});

	it("rejects filetypes", function() {
		isNotFiletype("image.jpg");
		isNotFiletype("image.jpeg");
		isNotFiletype("image.gif");
		isNotFiletype("audio.mp3");
		isNotFiletype("file");

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