import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import React, { useState } from 'react';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

export function VerifyEmail() {
	const [sending, setSending] = useState(false);
	if (sending) {
		return (
			<div className="alert alert-success" role="alert">
				<strong>
					{i18n('profile.verifyEmail.mailOnItsWay', 'Verification e-mail on its way.')}
				</strong>
				<br />
				{i18n(
					'profile.sendingVerificationMail',
					'You will be sent a verification e-mail to click shortly.',
				)}
			</div>
		);
	}

	return (
		<button
			type="button"
			className="btn btn-secondary js-verify-mail-btn"
			onClick={async (e) => {
				e.preventDefault();

				setSending(true);

				try {
					await emailMethods.sendVerificationEmail();
					Alert.success(
						i18n(
							'profile.sentVerificationMail',
							'Verification mail has been sent to your address: "{MAIL}".',
							{ MAIL: Meteor.user()?.emails[0].address },
						),
					);
				} catch (err) {
					setSending(false);
					Alert.serverError(
						err,
						i18n('profile.sentVerificationMail.error', 'Could not send verification e-mail'),
					);
				}
			}}
		>
			<span className="fa-solid fa-paper-plane fa-fw" aria-hidden="true"></span>
			{i18n('profile.verifymail', 'Resend verification e-mail')}
		</button>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(VerifyEmail.name, () => VerifyEmail);
