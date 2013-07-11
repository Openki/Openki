
/* ------------------------- Query / List ------------------------- */
//querry anpassung

get_courselist=function(listparameters){
	//return a course list
	var find ={};
	// modify query --------------------
	if(listparameters.courses_from_userid)
		// show courses that have something to do with userid
		find = _.extend(find, { $or : [ { "organisator" : listparameters.courses_from_userid}, {"subscribers":listparameters.courses_from_userid} ]});
	if(listparameters.missing=="organisator")
		// show courses with no organisator
		find = _.extend(find, {$or : [ { "organisator" : undefined}, {"organisator":""} ]});
	if(listparameters.missing=="subscribers")
		// show courses with not enough subscribers
		find = _.extend(find, {$where: "(this.subscribers && this.subscribers.length < this.subscribers_min) || (!this.subscribers)"} );

	return Courses.find(find, {sort: {time_created: -1}});
}





/* ------------------------- List types / Templates ------------------------- */

  Template.courselist.courses = function () {
  // needed to actualize courses
   return this.courses;
  };

  // Template handlers ---------------


  //marcel: nur damit funktion nomals aufgerufen wird
  // gibt datenbankeintrag zurück courses zuweisen.
  // schön währe wenn parameter gibts zurück in courselist
  // kann von vier verschiedenen orten aufgerufen werden und macht vier mal ein bisschen was anderes

  Template.coursepage.all_courses = function () {
  	  var return_object={};
  	  return_object.courses= get_courselist({});
  	  return return_object;
  };

  Template.home.missing_organisator = function() {
  	  var return_object={};
  	  return_object.courses= get_courselist({missing: "organisator"});
  	  return return_object;
  }

 Template.home.missing_subscribers = function() {
  	  var return_object={};
  	  return_object.courses= get_courselist({missing: "subscribers"});
  	  return return_object;
  }

   Template.profile.courses_from_userid = function() {
  	  var return_object={};
  	  return_object.courses= get_courselist({courses_from_userid: Meteor.userId()});
  	  return return_object;
  }


/* ------------------------- User Helpers ------------------------- */

Template.course.subscribers_status = function() {
  if (this.subscribers_min === null) return 'maybe'
	return this.subscribers_length >= this.subscribers_min ? 'ok' : 'notyet'
}

Template.course.organisator_status = function() {
	return this.organisator ? 'ok' : 'notyet'
}


Template.course.categorynames = function() {
	return Categories.find({_id: {$in: course.categories}}).map(function(cat) { return cat.name }).join(', ')
}

  Template.course.is_subscribed = function () {
  	  // is current user subscriber
   	   if(Meteor.userId()){
   	   	   if(this.subscribers){
		    if(this.subscribers.indexOf(Meteor.userId())!=-1){
			  return  true;
		    }else{
			return false;
		    }
		   }
 	   }
   };

   Template.course.is_organisator = function () {
  	  // is current user organisator
   	   if(Meteor.userId()){
 	  if (this.organisator==Meteor.userId()){
 	  	  	return  true;
 	  	}else{
 	  		return false;
 	  	}
 	  }
   };


/* -------------------------  Events-------------------------*/

  Template.course.events({
    'click': function () {

      Router.setCourse( this._id, this.name);

    }
  });
