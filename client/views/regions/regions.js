Template.region_sel_outer.created = function(){
	 this.subscribe("Regions");
	 var instance = this;
	 instance.searchingRegions = new ReactiveVar(false);
};

Template.region_sel_outer.helpers({
	searchingRegions: function() {
		return Template.instance().searchingRegions.get();
	}
});

Template.regionsDisplay.helpers({
	region: function(){
		var region = Regions.findOne(Session.get('region'));
		return region;
	}
});

Template.regionsDisplay.events({
	'click .-regionsDisplay': function(event, instance) {
		instance.parentInstance().searchingRegions.set(true);
	}
});

Template.region_sel.onCreated(function() {
	this.regionSearch = new ReactiveVar('');
});

Template.region_sel.rendered = function(){
	Template.instance().$('.js-regions-search').select();
};

var updateRegionSearch = function(event, instance) {
	var search = instance.$('.js-regions-search').val();
	search = String(search).trim();
	instance.regionSearch.set(search);
};

Template.region_sel.helpers({
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

	region: function(){
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

	courses: function() {
		return coursesFind({ region: this._id }).count();
	},

	currentRegion: function() {
		var region = this._id || "all";
		return region == Session.get('region');
	}
});

Template.region_sel.events({
	'click a.regionselect': function(event, instance){
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

	'mouseover li.region a.regionselect': function() {
		if (Session.get('region') == "all")
			$('.courselist_course').not('.'+this._id).stop().fadeTo('slow', 0.33);
	},

	'mouseout li.region a.regionselect': function() {
		if (Session.get('region') == "all")
			$('.courselist_course').not('.'+this._id).stop().fadeTo('slow', 1);
	},

	'keyup .js-regions-search': _.debounce(updateRegionSearch, 100),

	'focus .js-regions-search': function(event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'blur .js-regions-search': function(event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
		instance.parentInstance().searchingRegions.set(false);
	}
});
