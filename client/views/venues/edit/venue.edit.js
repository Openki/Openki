"use strict";

Template.venueEdit.onCreated(function() {
	this.showAdditionalInfo = new ReactiveVar(false);
	this.isNew = !this.data._id;
});

Template.venueEdit.helpers({
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
	}
});



Template.venueEdit.events({
	'submit': function(event, instance) {
		event.preventDefault();

		if (pleaseLogin()) return;

		var changes =
			{ name:          instance.$('.js-name').val()
			, description:   instance.$('.js-description').val()
			, address:       instance.$('.js-address').val()
			, route:         instance.$('.js-route').val()
			, maxpeople:     parseInt(instance.$('.js-maxpeople').val(), 10)
			, maxworkplaces: parseInt(instance.$('.js-maxworkplaces').val(), 10)
		    };

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
				showServerError('Saving the location went wrong', err);
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
