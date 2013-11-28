Template.locationlist.locations=function(){
	var locations=Locations.find({});
	for(m = 0; m < locations.count(); m++){
		loc=locations.db_objects[m];
		if(loc.hosts.contact.indexOf(Meteor.userId())!=-1){
			loc.ismylocation="true";
		}
	}
	return locations;
}

Template.location.events({
	'click input.edit_location': function () {
		alert('Work in progress, comming soon...');
		Session.set("edit_location", this._id);
	}
});
