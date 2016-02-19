Template.region_sel.helpers({
	regions: function(){
	  return Regions.find();
	},

	region: function(){
		var region = Regions.findOne(Session.get('region'));
		return region;
	}
});

Template.region_sel.events({
	'click a.regionselect': function(e){
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
		e.preventDefault();
	}
});
