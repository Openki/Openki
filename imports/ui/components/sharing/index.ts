import Shariff from 'shariff';

import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Analytics } from '/imports/ui/lib/analytics';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<'sharing', never, { shariff: any }>;

const template = Template.sharing;

template.onRendered(function () {
	this.autorun(() => {
		this.shariff = new Shariff(this.find('.shariff'), {
			lang: Session.get('locale'),
			mailUrl: 'mailto:',
			services: ['twitter', 'facebook', 'telegram', 'whatsapp', 'mail'],
		});

		this.$('.fab, .fas').addClass('fa fa-fw');
	});
});

template.events({
	'click .shariff a'(event) {
		// this reads out which social button it is, e.g. facebook, twitter
		const source = $(event.currentTarget)
			.parent()
			.attr('class')
			?.replace('shariff-button', '')
			.trim();

		Analytics.trackEvent('social', `${source} clicked`);
	},
});
