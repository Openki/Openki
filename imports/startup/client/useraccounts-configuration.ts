import { Accounts } from 'meteor/accounts-base';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';

import * as Alert from '/imports/api/alerts/alert';

Accounts.onEmailVerificationLink((token: string) => {
	Router.go('profile');
	Accounts.verifyEmail(token, (error) => {
		if (error) {
			Alert.serverError(error, 'Address could not be verified');
		} else {
			Alert.success(i18n('email.verified', 'Your e-mail has been verified.'));
		}
	});
});
