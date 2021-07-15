import { Accounts } from 'meteor/accounts-base';
import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';

import * as Alert from '/imports/api/alerts/alert';

Accounts.onEmailVerificationLink((/** @type {string} */ token) => {
	Router.go('profile');
	Accounts.verifyEmail(token, (error) => {
		if (error) {
			Alert.serverError(error, 'Address could not be verified');
		} else {
			Alert.success(mf('email.verified', 'Your e-mail has been verified.'));
		}
	});
});
