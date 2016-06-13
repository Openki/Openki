Router.map(function () {
	this.route('ipTest', {
		path: '/ipTest',
		template: 'ipTest',
	});
});

Template.ipTest.onCreated(function() {
	this.ip = new ReactiveVar('');
});


Template.ipTest.helpers({
	GeoData: function() {
		return Template.instance().ip.get() || '';
	},
	SessionGeoData: function() {
		return Session.get('ip');
	},
});

Template.ipTest.events({
	'click .-testIp': function(event, template) {
		event.preventDefault();
		var ip = template.$('.-ip').val();
		Meteor.call('ipToGeo', ip, function(error, geoData) {
			if (error || geoData === null) {
				addMessage('error', 'danger');
			} else {
				addMessage('SUCCESS:  country: '+geoData.country+', region: '+geoData.region+', city: '+geoData.city, 'success');

				template.ip.set(geoData);
				Session.set('ip', geoData);
			}
		});
	},
});

