import { check } from 'meteor/check';
import { mf } from 'meteor/msgfmt:core';
import { Alerts } from './alerts';

/**
 * Private method to add an alert message
 * @param {string} type type of alert message
 * @param {string} message the message text
 * @param {number} timeout timeout for the alert to disappear
 */
function _alert(type, message, timeout = 4000) {
	check(type, String);
	check(message, String);
	check(timeout, Number);

	Alerts.insert({ type, message, timeout });
}

/**
 * @param {string} message the message text
 */
export function success(message) {
	check(message, String);
	_alert('success', message);
}

/**
 * @param {string} message the message text
 */
export function warning(message) {
	check(message, String);
	_alert('warning', message);
}

/**
 * Create an error from String
 * @param {string} errorString error message
 */
export function error(errorString) {
	check(errorString, String);

	const errorMessage = mf(
		'_clientError',
		{ ERROR: errorString },
		'There was an error: "{ERROR}." Sorry about this.',
	);

	_alert('error', errorMessage, 60000);
}

/**
 * Add an error alert
 * @param {Error | string} errorOrMessage error object or message text
 * @param {string} [message] the message text
 */
export function serverError(errorOrMessage, message) {
	if (typeof message !== 'string') {
		check(errorOrMessage, String);

		const errorMessage = mf(
			'_serverErrorMessageOnly',
			{ MESSAGE: errorOrMessage },
			'There was an error on the server: "{MESSAGE}." Sorry about this.',
		);

		_alert('error', errorMessage, 60000);
	} else {
		check(errorOrMessage, Error);
		check(message, String);

		const errorMessage = mf(
			'_serverError',
			{ ERROR: errorOrMessage, MESSAGE: message },
			'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.',
		);

		_alert('error', errorMessage, 60000);
	}
}
