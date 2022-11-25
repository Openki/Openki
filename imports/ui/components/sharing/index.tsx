import Shariff from 'shariff';
import { i18n } from '/imports/startup/both/i18next';
import React, { useEffect } from 'react';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import * as Analytics from '/imports/ui/lib/analytics';

import './styles.scss';

export function Sharing() {
	useEffect(() => {
		const $shariff = $('.shariff');
		// eslint-disable-next-line no-new
		new Shariff($shariff, {
			lang: Session.get('locale'),
			mailUrl: 'mailto:',
			services: ['linkedin', 'twitter', 'facebook', 'telegram', 'whatsapp', 'mail'],
		});

		$shariff.find('.fab, .fas').addClass('fa fa-fw');

		$shariff.on('click', 'a', function (event) {
			// this reads out which social button it is, e.g. facebook, twitter
			const source = $(event.currentTarget)
				.parent()
				.attr('class')
				?.replace('shariff-button', '')
				.trim();

			Analytics.trackEvent('social', `${source} clicked`);
		});
	});

	return (
		<div className="shariff-wrapper">
			<p>{i18n('sharing.title', 'Share this course with your friends')}</p>
			<div
				className="shariff"
				data-mail-body={`${i18n(
					'sharing.mailbody.quote',
					'look what I found, are you interested?',
				)} {url}`}
			></div>
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(Sharing.name, () => Sharing);
