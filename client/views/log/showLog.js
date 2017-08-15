import '/imports/collections/Log.js';

Router.map(function () {
	this.route('log',  {
		path: '/log',
		template: 'showLog',
		data: function() {
			return this.params.query;
		},
		onAfterAction: function() {
			document.title = webpagename + "LOG";
		}
	});
});

Template.showLog.onCreated(function() {
	const instance = this;
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
	instance.limit = new ReactiveVar(100);

	var filter = Filtering(LogPredicates);
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
		// when more is demanded
		const overLimit = instance.limit.get() + 101;
		subs.subscribe('log', filterQuery, overLimit, function() {
			instance.ready.set(true);
		});
	});
});


Template.showLog.helpers({
	'privileged': function() {
		return privileged(Meteor.user(), 'admin');
	},

	'date': function() {
		const date = Template.instance().filter.toParams().date;
		return date && date.toISOString() || "";
	},

	'relFilter': function() {
		const rel = Template.instance().filter.toParams().rel;
		return rel || "";
	},

	'shortId': function(id) {
		return id.substr(0, 8);
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
		return Log.findFilter(filterQuery, instance.limit.get());
	},


	'loading': function() {
		return Template.instance().ready.get();
	},
});


Template.showLog.events({
	'keyup .js-date-input': _.debounce(function(event, instance) {
		const filter = instance.filter;
		var dateStr = $('.js-rel-input').val().trim();
		if (dateStr === '') {
			filter.disable('date').done();
		} else {
			filter.add('date', dateStr).done();
		}
	}, 200),

	// Update the URI when the search-field was changed an loses focus
	'change .js-update-url': function(event, instance) {
		instance.updateUrl();
	},

	'keyup .js-rel-input': _.debounce(function(event, instance) {
		const filter = instance.filter;
		filter.disable('rel');

		const relStr = $('.js-rel-input').val().trim();
		if (relStr) filter.add('rel', relStr)

		filter.done();
	}, 200),

	'click .js-rel-id': function(event, instance) {
		instance.filter.add('rel', ""+this).done();
		instance.updateUrl();
		window.scrollTo(0, 0);
	},

	'click .js-track': function(event, instance) {
		instance.filter.add('track', ""+this._id).done();
		instance.updateUrl();
		window.scrollTo(0, 0);
	},

	'click .js-more': function(event, instance) {
		var limit = instance.limit;
		limit.set(limit.get() + 100);
	}
});
