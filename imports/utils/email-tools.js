/** Check a string if it is a valid email adress
  *
  * @param {String} the string to be checked
  */
const IsEmail = function (str) {
	check(str, String);
	return str.search(/^[^@\s]+@([^@.\s]+\.)+\w+$/g) === 0;
};

export default IsEmail;

/** Logo that can be attached to mails
  *
  * path: a file path relative to private/
  */
 export const logo = function (path) {
	const cid = Random.id();
	this.url = `cid:${cid}`;
	this.attachement = {
		cid,
		path: Assets.absoluteFilePath(path),
		filename: false,
	};
	return this;
};
