export const IsUrl = function(url) {
	check(url, String);
	return url.search(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi) === 0;
};

export const IsFiletype = function(filename, allowedExtensions) {
	for (let allowedExtension of allowedExtensions) {
		if ( filename.endsWith('.' + allowedExtension) ) return true;
	}
	return false;
};