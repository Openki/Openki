Template.locationlist.locations=function(){
	var region = Session.get('region')
	var locations = Locations.find({region: region});
	for(m = 0; m < locations.count(); m++){
		loc = locations.db_objects[m];
		if(loc.hosts.contact.indexOf(Meteor.userId()) != -1){
			loc.ismylocation = "true";
		}
	}
	return locations;
}

Template.locationlist.region=function(){
	var regionId = Session.get('region')
	var regionObj = Regions.findOne(regionId)
	var regionName = regionObj ? regionObj.name : 'all regions'
	return regionName
}



Template.location.events({
	'click input.edit_location': function () {
		alert('Work in progress, comming soon...');    // TODO!
		Session.set("edit_location", this._id);
	}
});
