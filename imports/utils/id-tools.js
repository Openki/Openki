export default IdTools = {
	// Return its _id field if thing is an object, else return the thing itself.
	extract(thing) {
		return thing._id || ''+thing;
	}
};
