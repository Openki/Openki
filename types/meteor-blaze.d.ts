declare module 'meteor/blaze' {
	const Handlebars: any;

	namespace Blaze {
		function _escape(str: string): string;
	}
}
