/**
 * Return its _id field if thing is an object, else return the thing itself.
 * @param {string | { _id: string; }} thing
 * @returns {string}
 */
export function extract(thing) {
	return thing._id || `${thing}`;
}

export default extract;
