"use strict";

Router.map(function() {
	this.route('locationDetails', {
		path: 'venue/:_id/:name?',
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
			if (!this.data()) return;
			document.title = webpagename + this.data().location.name + " - venue-details"
		}
	})
})



/////////////////////////////////////////////////// map

Template.locationDetails.onCreated(function() {
	var markers = new Meteor.Collection(null);
	this.markers = markers;

	this.setLocation = function(location) {
		markers.remove({ main: true });
		if (location && location.loc) {
			markers.insert({
				loc: location.loc,
				main: true
			});
		}
	}

	this.setRegion = function(region) {
		markers.remove({ center: true });
		if (region && region.loc) {
			markers.insert({
				loc: region.loc,
				center: true
			});
		}
	}
});

Template.locationDetails.onRendered(function() {
	var instance = this;

	this.setLocation(this.data.location);

	var region = Regions.findOne(instance.data.location.region);
	instance.setRegion(region);
});







Template.locationDetails.helpers({

	 isEditing: function () {
		return Session.get("isEditing");
	},

	canEditLocation: function () {
		return this.hosts && this.hosts.indexOf(Meteor.userId()) !== -1;
	},

	markers: function() {
		return Template.instance().markers;
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
