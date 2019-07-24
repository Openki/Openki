import Alerts from './alerts';

export default Alert = {
	/** Add an error alert
      *
      * @param  {Error}   error        - error object
      * @param  {String}  message      - the message text
      *
      */
	error(error, message) {
		check(error, Error);
		check(message, String);

		const errorMessage = mf(
			'_serverError',
			{ ERROR: error, MESSAGE: message },
			'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.',
		);

		this._alert('error', errorMessage, 60000);
	},

	/** Private method to add an alert message
      *
      * @param  {String}  type         - type of alert message
      * @param  {String}  message      - the message text
      * @param  {Integer} timeout      - timeout for the alert to disappear
      *
      */
	_alert(type, message, timeout = 4000) {
		check(type, String);
		check(message, String);
		check(timeout, Number);

		Alerts.insert({ type, message, timeout });
	},
};

['success', 'warning'].forEach((type) => {
	/** Add an alert of type XY, using the default options
      *
      * @param  {String} message - the message text
      *
      */
	Alert[type] = function (message) {
		check(message, String);
		this._alert(type, message);
	};
});
