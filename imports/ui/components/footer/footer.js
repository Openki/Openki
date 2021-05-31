import { mf, msgfmt } from 'meteor/msgfmt:core';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import Version from '/imports/api/version/version';

import './footer.html';

Template.footer.helpers({
	links() {
		// Depend on locale and a composite mf string so we update reactively when locale changes
		// and msgfmt finish loading translations
		msgfmt.loading();
		Session.get('locale');

		return (Meteor.settings.public.footerLinks || []).map((linkSpec) => ({
			link: linkSpec.link,
			text: linkSpec.key ? mf(linkSpec.key) : linkSpec.text,
			title: linkSpec.title_key ? mf(linkSpec.title_key) : '',
		}));
	},
	version() {
		const version = Version.findOne();
		return version && version.basic + (version.branch !== 'master' ? ` ${version.branch}` : '');
	},
	fullInfo() {
		const version = Version.findOne();
		return (
			version &&
			`${version.complete} on "${version.branch}" from ${version.commitDate} - restarted: ${moment(
				version.lastStart,
			).format('lll')}`
		);
	},
	commit() {
		const version = Version.findOne();
		return version?.commitShort;
	},
	deployed() {
		const version = Version.findOne();
		return version?.activation;
	},
	restart() {
		const version = Version.findOne();
		return version?.lastStart;
	},
});
