import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// "_id"           -> ID
// "message"       -> {
//   "type"      -> String
//   "message"   -> String
//   "timeout"   -> Integer
// }
export default AlertMessages = new Mongo.Collection(null);

/** Add an alert message
  *
  * @param  {String} type         - type of alert message
  * @param  {String} text         - the message text or, if 'error', the error object
  * @param  {String} errorMessage - additional message text for error alert
  *
  */
AlertMessages.add = function(type, text, errorMessage) {
	check(type, String);
	check(text, Match.OneOf(String, Error));
	check(errorMessage, Match.Optional(String));

	let message;
	let timeout;

	if (type === 'error') {
		const error = text;
		message = mf(
			'_serverError',
			{ ERROR: error, MESSAGE: errorMessage },
			'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.'
		);
		timeout = 60000;
	} else {
		message = text;
		timeout = 4000;
	}

	this.insert({ type, message, timeout });
};
