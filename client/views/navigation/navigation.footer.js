Template.footer.helpers({
	version: function() { return VERSION && VERSION.basic+(VERSION.branch !== 'master' ? " "+VERSION.branch : ''); },
	fullVersion: function() { return VERSION && VERSION.complete+' "'+VERSION.branch+'" '+VERSION.timestamp+" "+VERSION.commit; }
});