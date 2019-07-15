import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import Analytics from '/imports/ui/lib/analytics.js';
import Shariff from '/imports/ui/lib/shariff.js';

import './sharing.html';

Template.sharing.onRendered(function() {
	this.autorun(() => {
		this.shariff = new Shariff(this.find('.shariff'), {
			lang: Session.get('locale'),
			mailUrl: 'mailto:',
			services: [
				'twitter',
				'facebook',
				'whatsapp',
				'mail',
			]
		});

		this.$('.fa').addClass('fa-fw');
	});
});

Template.sharing.events({

	'click .shariff a'(event, instance) {
		//this reads out which social button it is, e.g. facebook, twitter
		const source = $(event.currentTarget).parent().attr('class').replace('shariff-button', '').trim();

		Analytics.trytrack((tracker) => {
			tracker.trackEvent('social', source + ' clicked');
		});
	}

});
