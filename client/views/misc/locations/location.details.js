"use strict";

Template.location_details.helpers({
		
	 isEditing: function () {

		return Session.get("isEditing");
	},

	canEditLocation: function () {
		return this.hosts && this.hosts.indexOf(Meteor.userId()) !== -1;
	}
});











Template.location_details.events({
	
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

