"use strict";

Template.location_edit.helpers({
		
	regions: function(){
	  return Regions.find();
	},
	addHost: function () {
		return Session.get("addHost");
	},
	locationHosts: function(){
		return Session.get("locationHosts");
	},
	addHostSearch: function(){
		return search_user($('#search_username').val());
	},
	regionSel: function() {
		var attr = {};
		var selected = Session.get('region');
		if (selected && selected === this._id) {
			attr.selected = 'selected';
		}
		return attr;
	}
});



Template.location_edit.events({
	'submit form.location_edit, click input.save': function (ev) {
		ev.preventDefault()
		

		try {
			if (!Meteor.userId()){  // TODO: AUTHENTICATION SHIT, USER ALLOWED TO EDIT?
			    alert("Please log in!")
			    throw "Please log in!"
			} 
			
			var locationId = this._id ? this._id : ''
			var isNew = locationId === ''	

			var changes = {
				description: $('#editform_description').val(),
				name: $('#editform_name').val(),
				address: $('#editform_address').val(),
				route: $('#editform_route').val(),
				maxpeople: $('#editform_maxpeople').val(),
				maxworkplaces: $('#editform_maxworkplaces').val(),
				hosts: Session.get("locationHosts")
			}

			if (isNew) {
				changes.region = $('.region_select').val()
				if (!changes.region) {
					alert("Please select a region"+$('.region_select').val())
					return;
				}
			}

			Meteor.call("save_location", locationId, changes, function(err, locationId) {
				Session.set("isEditing", false);
				Session.set('search', ''); // clear searchfield
				if (err) alert("Saving the location went terribly wrong: "+err)
				if (isNew){
					Router.go('locationDetails', {_id: locationId}) // TODO: Slug is not included in url			
				}
			})



		} catch(err) {
			if (err instanceof String) alert(err)
			else throw err
		}
	},

	'click input.addhost': function() {
		Session.set("addHost", false); // that it reloads
		Session.set("addHost", true);
	},

	'click input.cancel_addhost': function() {
		Session.set("addHost", false);
	},

	'click input.save_addhost': function() {
		Session.set("addHost", false);

		var hosts=Session.get("locationHosts");
		var new_host=$("#addhost_id").val();
		if(hosts.indexOf(new_host) == -1) {
			hosts.push(new_host);
			Session.set("locationHosts",hosts);
		}else{
			alert("This host ist already in list.")
		}
	},

	'click input.remove_host': function() {

		if(Meteor.userId()==this){
			if(!confirm('Delete yourself from hosts? You loose write permissions!'))
			return;
		}

		var hosts=Session.get("locationHosts");

		var index = hosts.indexOf(this);
		hosts.splice(index, 1);

		Session.set("locationHosts",hosts);

	},



	'click input.cancel': function() {
		Session.set("isEditing", false);
	},

	'click input.edit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		// gehe in den edit-mode, siehe html
	}

});

