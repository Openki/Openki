"use strict";

Router.map(function() {
	this.route('locationDetails', {
		path: 'venue/:_id/:location?',
		waitOn: function () {
			return [
				Meteor.subscribe('locationDetails', this.params._id),
				Meteor.subscribe('eventsFind', { location : this.params._id })
			];
		},
		data: function () {
			var location =  Locations.findOne({_id: this.params._id});
			if (!location) return false;

			return {
				'location': location,
				'events': eventsFind ({location : this.params._id})
			};
		},
		onAfterAction: function() {
			document.title = webpagename + this.data().location.name + " - venue-details"
		}
	})
})




Template.locationDetails.helpers({
		
	 isEditing: function () {

		return Session.get("isEditing");
	},

	canEditLocation: function () {
		return this.hosts && this.hosts.indexOf(Meteor.userId()) !== -1;
	}
});











Template.locationDetails.events({
	
	'click input.edit': function () {
		if (pleaseLogin()) return;

		// das reicht wohl noch nicht, muss auf server-seite passieren?
		if(this.hosts.indexOf(Meteor.userId())==-1 ) {
			alert("No admin rights");
			return;}

		// gehe in den edit-mode, siehe html

		Session.set("locationHosts",this.hosts)
		Session.set("isEditing", true);

	},

	'click input.del': function () {
		if (pleaseLogin()) return;

		// das reicht wohl noch nicht, muss auf server-seite passieren?
		if(this.hosts.indexOf(Meteor.userId())==-1 ) {
			alert("No Aadmin rights");
			return;}

		if(confirm('Whoa! Really delete location?')){
			Locations.remove(this._id);
			Router.go('/locations/');
		}
	}

});

