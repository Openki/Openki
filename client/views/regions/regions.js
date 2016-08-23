Template.regionSelectionWrap.created = function() {
	 this.subscribe("Regions");
	 var instance = this;
	 instance.searchingRegions = new ReactiveVar(false);
};

Template.regionSelectionWrap.helpers({
	searchingRegions: function() {
		return Template.instance().searchingRegions.get();
	}
});

Template.regionDisplay.helpers({
	region: function() {
		var region = Regions.findOne(Session.get('region'));
		return region;
	}
});

Template.regionDisplay.events({
	'click .js-region-display': function(event, instance) {
		instance.parentInstance().searchingRegions.set(true);
	}
});

Template.regionSelection.onCreated(function() {
	this.regionSearch = new ReactiveVar('');
});

Template.regionSelection.rendered = function() {
	Template.instance().$('.js-region-search').select();
};

var updateRegionSearch = function(event, instance) {
	var search = instance.$('.js-region-search').val();
	search = String(search).trim();
	instance.regionSearch.set(search);
};

Template.regionSelection.helpers({
	regions: function() {
		var search = Template.instance().regionSearch.get();
		var query = {};
		if (search !== '') query = { name: new RegExp(search, 'i') };

		return Regions.find(query);
	},

	regionNameMarked: function() {
		var search = Template.instance().regionSearch.get();
		var name = this.name;
		if (search === '') return name;
		var match = name.match(new RegExp(search, 'i'));

		// To add markup we have to escape all the parts separately
		var marked;
		if (match) {
			var term = match[0];
			var parts = name.split(term);
			marked = _.map(parts, Blaze._escape).join('<strong>'+Blaze._escape(term)+'</strong>');
		} else {
			marked = Blaze._escape(name);
		}
		return Spacebars.SafeString(marked);
	},

	region: function() {
		var region = Regions.findOne(Session.get('region'));
		return region;
	},

	allCourses: function() {
		return _.reduce(Regions.find().fetch(), function(acc, region) {
			return acc + region.courseCount;
		}, 0);
	},

	allUpcomingEvents: function() {
		return _.reduce(Regions.find().fetch(), function(acc, region) {
			return acc + region.futureEventCount;
		}, 0);
	},

	currentRegion: function() {
		var region = this._id || "all";
		return region == Session.get('region');
	}
});

Template.regionSelection.events({
	'click .js-region-link': function(event, instance) {
		event.preventDefault();
		var region_id = this._id ? this._id : 'all';
		var changed = Session.get('region') !== region_id;

		localStorage.setItem("region", region_id); // to survive page reload
		Session.set('region', region_id);

		// When the region changes, we want the content of the page to update
		// Many pages do not change when the region changed, so we go to
		// the homepage for those
		if (changed) {
			var routeName = Router.current().route.getName();
			var routesToKeep = ['home', 'find', 'locations', 'calendar'];
			if (routesToKeep.indexOf(routeName) < 0) Router.go('/');
		}
		instance.parentInstance().searchingRegions.set(false);
	},

	'mouseover .js-region-link:not(.all-regions-link)': function() {
		if (Session.get('region') == "all") {
			courseFilterPreview(true, '.'+this._id);
		}
	},

	'mouseout .js-region-link:not(.all-regions-link)': function() {
		if (Session.get('region') == "all") {
			courseFilterPreview(false, '.'+this._id);
		}
	},

	'keyup .js-region-search': _.debounce(updateRegionSearch, 100),

	'focus .js-region-search': function(event, instance) {
		var viewportWidth = Session.get('viewportWidth');
		var screenMd = viewportWidth >= 768 && viewportWidth <= 992;
		if (screenMd) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 0);
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').hide();
		}
		instance.$('.dropdown-toggle').dropdown('toggle');
	},
});

Template.regionSelection.onRendered(function() {
	var parentInstance = this.parentInstance();
	parentInstance.$('.dropdown').on('hide.bs.dropdown', function(e) {
		var viewportWidth = Session.get('viewportWidth');
		var screenMd = viewportWidth >= 768 && viewportWidth <= 992;
		if (screenMd) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').show();
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 1);
		}
		parentInstance.searchingRegions.set(false);
	});
});
