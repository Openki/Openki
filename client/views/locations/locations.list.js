Template.locationlist.locations=function(){
	
	var locations=Locations.find({});
	
	     for(m = 0; m < locations.count(); m++){
     	     
     	     loc=locations.db_objects[m];
     	   if(loc.users.indexOf(Meteor.userId())!=-1){
     	   	   loc.mylocation="is_mylocation";
	     }
	}
	return locations;
	
	
}
