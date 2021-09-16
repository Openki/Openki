import { expect } from 'chai';
import { isEmail } from './email-tools';

describe('Email validation', () => {
	const expectEmail = (str: string) => expect(isEmail(str)).to.be.true;
	const expectNotEmail = (str: string) => expect(isEmail(str)).to.be.false;
	const fails = (notaString: any) => expect(() => isEmail(notaString)).to.throw();

	it('accepts normal emails', () => {
		expectEmail('Jah7reix.poo0Ooz0@geemail.com');
		expectEmail('poo0Ooz0@geemail.com');
		expectEmail('diFoh7ma@wooow.example');
	});

	it('accepts more email formats', () => {
		expectEmail('Jah7reix.poo0Ooz0@subdomain.geemail.com');
		expectEmail('J@s.g.c');
		expectEmail('0@sub.sub.sub.sub.sub');
	});

	it('accepts weird email formats', () => {
		expectEmail('Jah7reix+poo0Ooz0@geemail.com');
		expectEmail('Ó@£.cooooooom');
		expectEmail('-@ä.c');
		expectEmail('{_}@n-o.c');
	});

	it('rejects incomplete addresses', () => {
		// Yes it is technically possible to have an address @toplevel
		// But we still assume it's an error.
		expectNotEmail('poo0Ooz0@geemail');

		expectNotEmail('@£.cooooooom');
		expectNotEmail('-@');
		expectNotEmail('diFoh7ma@.');
		expectNotEmail('diFoh7ma@.example');
		expectNotEmail('diFoh7ma@example.');
	});

	it('rejects other strings', () => {
		expectNotEmail('Jah7reix.poo0Ooz0geemail.com');
		expectNotEmail('Jah7reix.poo0Ooz0');
		expectNotEmail('poo0Ooz0');
		expectNotEmail('é');
		expectNotEmail('0');
		expectNotEmail('');
	});

	it('fails on non-strings', () => {
		(fails as any)();
		fails(undefined);
		fails(true);
		fails(false);
		fails({});
		fails(1.1);
	});
});
