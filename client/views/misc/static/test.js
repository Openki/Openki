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
//		console.log(Template.instance.$('.ip').val());
//		console.log(template);
//		console.log(template.$('.-ip'));
//		console.log(template.$('.-ip').val());
		var ip = template.$('.-ip').val();
//		console.log(ip)
//		console.log(GeoIP.lookup(ip))
//		var geo = GeoIP.lookup('8.8.8.8');
//		var GG =
		Meteor.call('ipToGeo', ip, function(error, geoData) {
		console.log(geoData);
			if (error || geoData == null) { addMessage('error', 'danger') }
			else {
				//geoData = geoData.values();
				//geoData = geoData.toString();
				//geoData = Object.entries(geoData);

				addMessage('SUCCESS:  country: '+geoData.country+', region: '+geoData.region+', city: '+geoData.city, 'success');
				//addMessage(geoData.val(), 'success');
				//addMessage(geoData.values(), 'success');
				//addMessage('hoi', 'success');

				//GGG('123');
				//GGGG = '1234';
				//return geoData;
				//Template.instance().ip.set('1');
				//Template.parentInstance().ip.set('2');
				//template.parentInstance().ip.set('3');
				template.ip.set(geoData);
				Session.set('ip', geoData);
			}
		});
//		console.log(GGG);
//		console.log(GGGG);
//		console.log('GG= '+GG);
//		console.log(GeoData);
//		var geo= '123';
//		Template.instance().ip.set(GG);  //works
	},
});

