import { check } from 'meteor/check';
import { mf } from 'meteor/msgfmt:core';
import { Alerts } from './alerts';

/**
 * Private method to add an alert message
 * @param type type of alert message
 * @param message the message text
 * @param timeout timeout for the alert to disappear
 */
function _alert(type: string, message: string, timeout: number = 4000) {
	check(type, String);
	check(message, String);
	check(timeout, Number);

	Alerts.insert({ type, message, timeout });
}

/**
 * @param message the message text
 */
export function success(message: string) {
	check(message, String);
	_alert('success', message);
}

/**
 * @param message the message text
 */
export function warning(message: string) {
	check(message, String);
	_alert('warning', message);
}

/**
 * Create an error from String
 * @param errorString error message
 */
export function error(errorString: string) {
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
 * @param errorOrMessage error object or message text
 * @param message the message text
 */
export function serverError(errorOrMessage: Error | string, message?: string) {
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
