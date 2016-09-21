"use strict";

Template.venueEdit.onCreated(function() {
	this.showAdditionalInfo = new ReactiveVar(false);
	this.isNew = !this.data._id;
});

Template.venueEdit.helpers({
	displayAdditionalInfo: function() {
		return {
			style: 'display: '+(Template.instance().showAdditionalInfo.get() ? 'block' : 'none')
		};
	},

	showAdditionalInfo: function() {
		return Template.instance().showAdditionalInfo.get();
	},

	regions: function(){
		return Regions.find();
	},

	regionSel: function() {
		var attr = {};
		var selected = Session.get('region');
		if (selected && selected === this._id) {
			attr.selected = 'selected';
		}
		return attr;
	},
});

Template.venueEditAdditionalInfo.helpers({
	facilitiesCheck: function(name) {
		var attrs = { class: 'js-' + name };
		if (this.facilities[name]) {
			attrs.checked = 'checked';
		}
		return attrs;
	}
});



Template.venueEdit.events({
	'submit': function(event, instance) {
		event.preventDefault();

		if (pleaseLogin()) return;

		var changes =
			{ name:            instance.$('.js-name').val()
			, description:     instance.$('.js-description').val()
			, address:         instance.$('.js-address').val()
			, route:           instance.$('.js-route').val()
			, short:           instance.$('.js-short').val()
			, maxPeople:       parseInt(instance.$('.js-maxPeople').val(), 10)
			, maxWorkplaces:   parseInt(instance.$('.js-maxWorkplaces').val(), 10)
			, facilities:      []
			, otherFacilities: instance.$('.js-otherFacilities').val()
			, website:         instance.$('.js-website').val()
		    };

		_.each(Venues.facilityOptions, function(f) {
			if (instance.$('.js-'+f).prop('checked')) {
				changes.facilities.push(f);
			}
		});

		if (instance.isNew) {
			var region = cleanedRegion(Session.get('region'));
			changes.region = region || $('.js-region').val();
			if (!changes.region) {
				alert("Please select a region");
				return;
			}
		}

		var venueId = this._id ? this._id : '';
		var parentInstance = instance.parentInstance();
		Meteor.call("venue.save", venueId, changes, function(err, venueId) {
			if (err) {
				showServerError('Saving the venue went wrong', err);
			} else {
				addMessage(mf('venue.saving.success', { NAME: changes.name }, 'Saved changes venue "{NAME}".'), 'success');
				if (instance.isNew) {
					Router.go('venueDetails', { _id: venueId });
				} else {
					parentInstance.editing.set(false);
				}
			}
		});
	},


	'click .js-toggle-additional-info-btn': function(event, instance) {
		instance.showAdditionalInfo.set(!instance.showAdditionalInfo.get());
	},


	'click .js-edit-cancel': function(event, instance) {
		if (instance.isNew) {
			Router.go('/');
		} else {
			instance.parentInstance().editing.set(false);
		}
	},
});
