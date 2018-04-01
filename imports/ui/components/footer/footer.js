import { Template } from 'meteor/templating';

import Version from '/imports/api/version/version.js';

import './footer.html';

Template.footer.helpers({
	version() {
		const version = Version.findOne();
		return version && version.basic+(version.branch !== 'master' ? " "+version.branch : '');
	},
	fullInfo() {
		const version = Version.findOne();
		return version && version.complete+' on "'+version.branch+'" from '+version.commitDate+" - restarted: "+moment(version.lastStart).format('lll');
	},
	commit() {
		const version = Version.findOne();
		return version && version.commitShort;
	},
	deployed() {
		const version = Version.findOne();
		return version && version.activation;
	},
	restart() {
		const version = Version.findOne();
		return version && version.lastStart;
	}
});
