import { Template } from 'meteor/templating';

import Version from '/imports/api/version/version';

import './footer.html';

Template.footer.helpers({
	links() {
		return (Meteor.settings.public.footerLinks || []).map(linkSpec => ({
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
		return version && `${version.complete} on "${version.branch}" from ${version.commitDate} - restarted: ${moment(version.lastStart).format('lll')}`;
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
