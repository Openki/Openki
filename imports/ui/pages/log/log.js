import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';
import TemplateMixins from '/imports/ui/lib/template-mixins.js';
import UrlTools from '/imports/utils/url-tools.js';

import Log from '/imports/api/log/log.js';

import './log.html';

Template.showLog.onCreated(function() {
	const instance = this;
	const batchLoad = 100;
	instance.updateUrl = () => {
		var filterParams = instance.filter.toParams();
		var queryString = UrlTools.paramsToQueryString(filterParams);

		var options = {};

		if (queryString.length) {
			options.query = queryString;
		}

		RouterAutoscroll.cancelNext();

		var router = Router.current();
		Router.go(router.route.getName(), {}, options);

		return true;
	};

	instance.ready = new ReactiveVar(false);
	instance.limit = new ReactiveVar(batchLoad);

	var filter = Log.Filtering();
	instance.filter = filter;

	// Read URL state
	instance.autorun(function() {
		var query = Template.currentData();
		filter
			.clear()
			.read(query)
			.done();
	});

	// Update whenever filter changes
	instance.autorun(function() {
		var filterQuery = filter.toQuery();
		instance.ready.set(false);

		// Have some extra log entries ready so that they are shown immediately
		// when more are demanded
		const overLimit = instance.limit.get() + batchLoad + 1;
		instance.subscribe('log', filterQuery, overLimit, function() {
			instance.ready.set(true);
		});
	});
});


Template.showLog.helpers({
	'privileged': function() {
		return UserPrivilegeUtils.privileged(Meteor.user(), 'admin');
	},

	'date': function() {
		const start = Template.instance().filter.get('start');
		return start && start.toISOString() || "";
	},

	'relFilter': function() {
		const rel = Template.instance().filter.toParams().rel;
		return rel || "";
	},

	'trFilter': function() {
		const tr = Template.instance().filter.toParams().tr;
		return tr || "";
	},

	isodate: function(date) {
		return moment(date).toISOString();
	},

	'hasMore': function() {
		var instance = Template.instance();

		var filterQuery = instance.filter.toQuery();
		var limit = instance.limit.get();
		var results = Log.findFilter(filterQuery, limit + 1);

		return results.count() > limit;
	},

	'results': function() {
		var instance = Template.instance();
		var filterQuery = instance.filter.toQuery();
		const entries = Log.findFilter(filterQuery, instance.limit.get()).fetch();
		let last = false;
		const inter = [];
		_.each(entries, (entry) => {
			const ts = moment(entry.ts);
			if (last) {
				let interval = moment.duration(last.diff(ts));
				if (interval.asMinutes() > 1) {
					inter.push({ interval: interval.humanize() });
				}
			}
			inter.push(entry);
			last = ts;
		});
		return inter;
	},


	'loading': function() {
		return !Template.instance().ready.get();
	},
});


Template.showLog.events({
	// Update the URI when the search-field was changed an loses focus
	'change .js-update-url': function(event, instance) {
		instance.updateUrl();
	},

	'keyup .js-tr-input': _.debounce(function(event, instance) {
		const filter = instance.filter;
		filter.disable('tr');

		const trStr = $('.js-tr-input').val().trim();
		if (trStr) filter.add('tr', trStr);

		filter.done();
	}, 200),

	'keyup .js-date-input': _.debounce(function(event, instance) {
		const filter = instance.filter;
		var dateStr = $('.js-date-input').val().trim();
		if (dateStr === '') {
			filter.disable('start').done();
		} else {
			filter.add('start', dateStr).done();
		}
	}, 200),

	'keyup .js-rel-input': _.debounce(function(event, instance) {
		const filter = instance.filter;
		filter.disable('rel');

		const relStr = $('.js-rel-input').val().trim();
		if (relStr) filter.add('rel', relStr);

		filter.done();
	}, 200),

	'click .js-tr': function(event, instance) {
		instance.filter.add('tr', ""+this);
		if (!event.shiftKey) {
			instance.filter.done();
			instance.updateUrl();
			window.scrollTo(0, 0);
		}
	},

	'click .js-date': function(event, instance) {
		var start = moment(this).toISOString();
		instance.filter.add('start', start);
		if (!event.shiftKey) {
			instance.filter.done();
			instance.updateUrl();
			window.scrollTo(0, 0);
		}
	},

	'click .js-rel-id': function(event, instance) {
		instance.filter.add('rel', ""+this);
		if (!event.shiftKey) {
			instance.filter.done();
			instance.updateUrl();
			window.scrollTo(0, 0);
		}
	},

	'click .js-more': function(event, instance) {
		var limit = instance.limit;
		limit.set(limit.get() + 100);
	}
});

TemplateMixins.MultiExpandible(Template.showLogEntry);
Template.showLogEntry.helpers(
	{ date:
		function() {
			const date = Template.instance().filter.toParams().date;
			return date && date.toISOString() || "";
		}
	, shortId:
		function(id) {
			return id.substr(0, 8);
		}
	, isodate:
		function(date) {
			return moment(date).toISOString();
		}
	, jsonBody:
		function() {
			return JSON.stringify(this.body, null, '   ');
		}
	}
);
