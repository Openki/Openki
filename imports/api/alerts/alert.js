import { check } from 'meteor/check';
import Alerts from './alerts';

const Alert = {
	/**
      * Create an error from String
      * @param  {string} errorString error message
      */
	error(errorString) {
		check(errorString, String);

		const errorMessage = mf(
			'_clientError',
			{ ERROR: errorString },
			'There was an error: "{ERROR}." Sorry about this.',
		);

		this._alert('error', errorMessage, 60000);
	},

	/**
      * Add an error alert
      * @param  {Error | string} errorOrMessage error object or message text
      * @param  {string} [message] the message text
      */
	serverError(errorOrMessage, message) {
		if (!message) {
			check(errorOrMessage, String);

			const errorMessage = mf(
				'_serverErrorMessageOnly',
				{ MESSAGE: errorOrMessage },
				'There was an error on the server: "{MESSAGE}." Sorry about this.',
			);

			this._alert('error', errorMessage, 60000);
		} else {
			check(errorOrMessage, Error);
			check(message, String);

			const errorMessage = mf(
				'_serverError',
				{ ERROR: errorOrMessage, MESSAGE: message },
				'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.',
			);

			this._alert('error', errorMessage, 60000);
		}
	},

	/**
      * Private method to add an alert message
      * @param {string} type type of alert message
      * @param {string} message the message text
      * @param {number} timeout timeout for the alert to disappear
      */
	_alert(type, message, timeout = 4000) {
		check(type, String);
		check(message, String);
		check(timeout, Number);

		Alerts.insert({ type, message, timeout });
	},
};

['success', 'warning'].forEach((type) => {
	/**
      * Add an alert of type XY, using the default options
      * @param {string} message the message text
      */
	Alert[type] = function (message) {
		check(message, String);
		this._alert(type, message);
	};
});

export default Alert;
