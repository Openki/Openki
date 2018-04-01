import { Meteor } from 'meteor/meteor';

import Regions from '../regions/regions.js';
import Venues from './venues.js';

import AsyncTools from '/imports/utils/async-tools.js';
import HtmlTools from '/imports/utils/html-tools.js';
import StringTools from '/imports/utils/string-tools.js';

Meteor.methods({
	'venue.save': function(venueId, changes) {
		check(venueId, String);
		check(changes,
			{ name:            Match.Optional(String)
			, description:     Match.Optional(String)
			, region:          Match.Optional(String)
			, loc:             Match.Optional(Match.OneOf(null, { type: String, coordinates: [Number] }))
			, address:         Match.Optional(String)
			, route:           Match.Optional(String)
			, short:           Match.Optional(String)
			, maxPeople:       Match.Optional(Number)
			, maxWorkplaces:   Match.Optional(Number)
			, facilities:      Match.Optional([String])
			, otherFacilities: Match.Optional(String)
			, website:         Match.Optional(String)
			}
		);

		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, "please log in");
		}

		var venue;
		var isNew = venueId.length === 0;
		if (!isNew) {
			venue = Venues.findOne(venueId);
			if (!venue) throw new Meteor.Error(404, "Venue not found");
		}

		/* Changes we want to perform */
		var set = { updated: new Date() };


		if (changes.description) set.description = HtmlTools.saneHtml(changes.description.trim().substring(0, 640*1024));
		if (changes.name) {
			set.name = changes.name.trim().substring(0, 1000);
			set.slug = StringTools.slug(set.name);
		}

		if (changes.address !== undefined) set.address = changes.address.trim().substring(0, 40*1024);
		if (changes.route !== undefined) set.route = changes.route.trim().substring(0, 40*1024);
		if (changes.short !== undefined) set.short = changes.short.trim().substring(0, 40);
		if (changes.loc !== undefined) {
			set.loc = changes.loc;
			set.loc.type = "Point";
		}

		if (changes.maxPeople !== undefined) set.maxPeople = Math.min(1e10, Math.max(0, changes.maxPeople));
		if (changes.maxWorkplaces !== undefined) set.maxWorkplaces = Math.min(1e10, Math.max(0, changes.maxWorkplaces));
		if (changes.facilities !== undefined) {
			set.facilities = _.reduce(changes.facilities, function(fs, f) {
				if (Venues.facilityOptions.indexOf(f) >= 0) {
					fs[f] = true;
				}
				return fs;
			}, {});
		}

		if (changes.otherFacilities) {
			set.otherFacilities = changes.otherFacilities.substring(0, 40*1024);
		}

		if (changes.website) {
			set.website = changes.website.substring(0, 40*1024);
		}

		if (isNew) {
			/* region cannot be changed */
			var region = Regions.findOne(changes.region);
			if (!region) throw new Meteor.Error(404, 'region missing');

			set.region = region._id;

			venueId = Venues.insert({
				editor: user._id,
				createdby: user._id,
				created: new Date()
			});
		}

		Venues.update({ _id: venueId }, { $set: set }, AsyncTools.checkUpdateOne);

		return venueId;
	},

	'venue.remove': function(venueId) {
		check(venueId, String);
		var venue = Venues.findOne(venueId);
		if (!venue) {
			throw new Meteor.Error(404, "No such venue");
		}

		if (!venue.editableBy(Meteor.user())) {
			throw new Meteor.Error(401, "Please log in");
		}

		return Venues.remove(venueId);
	}
});
