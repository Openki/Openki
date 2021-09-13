import { check } from 'meteor/check';
import i18next from 'i18next';
import { Alerts } from './alerts';

/**
 * Private method to add an alert message
 * @param type type of alert message
 * @param message the message text
 * @param timeout timeout for the alert to disappear
 */
function _alert(type: string, message: string, timeout = 4000) {
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

	const errorMessage = i18next.t(
		'_clientError',
		'There was an error: "{ERROR}." Sorry about this.',
		{ ERROR: errorString },
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

		const errorMessage = i18next.t(
			'_serverErrorMessageOnly',
			'There was an error on the server: "{MESSAGE}." Sorry about this.',
			{ MESSAGE: errorOrMessage },
		);

		_alert('error', errorMessage, 60000);
	} else {
		check(errorOrMessage, Error);
		check(message, String);

		const errorMessage = i18next.t(
			'_serverError',
			'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.',
			{ ERROR: errorOrMessage, MESSAGE: message },
		);

		_alert('error', errorMessage, 60000);
	}
}
