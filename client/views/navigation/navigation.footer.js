Template.footer.helpers({
	version: function() {
		var version = Version.findOne();
		return version && version.basic+(version.branch !== 'master' ? " "+version.branch : '');
	},
	fullInfo: function() {
		var version = Version.findOne();
		return version && version.complete+' on "'+version.branch+'" from '+version.commitDate+" - restarted: "+moment(version.lastStart).format('lll');
	},
	commit: function() {
		var version = Version.findOne();
		return version && version.commitShort;
	},
	deployed: function() {
		var version = Version.findOne();
		return version && version.activation;
	},
	restart: function() {
		var version = Version.findOne();
		return version && version.lastStart;
	}
});
