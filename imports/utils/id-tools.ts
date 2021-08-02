/**
 * Return its _id field if thing is an object, else return the thing itself.
 */
export function extract(thing: { _id: string } | string) {
	if (typeof thing === 'object') {
		return thing._id || `${thing}`;
	}

	return `${thing}`;
}

export default extract;
