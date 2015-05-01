
Router.map(function () {
	this.route('home', {
		path: '/',
		template: 'start',
		onBeforeAction: function() {
			// Allow setting the region in the URL by parameter '?region=Testistan'
			if (this.params.query.region) {
				var region = Regions.findOne({ name: this.params.query.region })
				if (region) Session.set('region', region._id);
			};
			this.next();
			var region = Session.get('region')
			console.log('Regions: '+region)
			if (region == undefined){
				var clientIp = '8.8.8.8' // this.request.connection.remoteAddress;
				console.log('ip: '+clientIp)
				Meteor.call ('autoSelectRegion', clientIp, function(error, regionId){
					console.log('regionId: '+regionId+'   error: '+error)
					if (regionId) Session.set('region', regionId)
				});
			} else {
				this.next();
			};
		},
		waitOn: function () {
			var region = Session.get('region')
			return [
				Meteor.subscribe('coursesFind', region, false, {}, 36)
			];
		},
		data: function() {
			return {
				results: Courses.find({}, {sort: {time_lastedit: -1}})
			}
		},
		onAfterAction: function() {
			document.title = webpagename + 'Home'
		}
	})
})