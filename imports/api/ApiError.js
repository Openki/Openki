/** Throw an error on the server, just return it on the client
  * This is useful for methods that get run on the client too to avoid
  * the "Exception while simulating the effect " situation. */
export default ApiError = function(error, reason, details) {
	const meteorError = new Meteor.Error(error, reason, details);

	if (Meteor.isServer) {
		throw meteorError;
	}

	return meteorError;
};
