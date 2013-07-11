
/* ------------------------- Query / List ------------------------- */
//querry anpassung

get_courselist=function(listparameters){
	//return a course list
	var find ={};
  if(Session.get('region')) find.region=Session.get('region')
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


// Idee für CSS:
// jede funktion_status returnt entweder
// "yes", "no", "ontheway" oder "notexisting"
Template.course.participant_status = function() {
	if (this.subscribers_min === null) return 'ontheway'
	return this.subscribers_length >= this.subscribers_min ? 'yes' : 'no'
}

Template.course.organisator_status = function() {
	return this.organisator ? 'yes' : 'no'
}

Template.course.mentor_status = function() {
	return this.roles.mentor.subscribed.length > 0 ? 'yes' : 'no'
}

Template.course.host_status = function() {
	return this.roles.host.subscribed.length > 0 ? 'yes' : 'no'
}


// Idee für provisorische Darstellung:
// Wenn Teilnehmer / Mentor / etc: return "*", sonst nichts
Template.course.is_subscriber = function() {
	return this.roles.participant.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}

Template.course.is_host = function() {
	return this.roles.host.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}

Template.course.is_organisator = function() {
  return "*"
}

Template.course.is_mentor = function() {
	return this.roles.mentor.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}


Template.course.categorynames = function() {
	return Categories.find({_id: {$in: course.categories}}).map(function(cat) { return cat.name }).join(', ')
}

/* -------------------------  Events-------------------------*/

  Template.course.events({
    'click': function () {

      Router.setCourse( this._id, this.name);

    }
  });
