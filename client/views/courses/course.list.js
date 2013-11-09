"use strict";

/* ------------------------- Query / List ------------------------- */
//querry anpassung

var get_courselist=function(listparameters){
   Session.set("isEditing", false);         //unschöner temporaerer bugfix
	//return a course list
	var find ={};
	
	if(listparameters.courses_from_userid)
		// show courses that have something to do with userid
		find = _.extend(find, { $or : [ { "roles.team.subscibed" : listparameters.courses_from_userid}, {"roles.participant.subscribed":listparameters.courses_from_userid} ]})
  else if(Session.get('region')) find.region=Session.get('region');
  // modify query --------------------
	if(listparameters.missing=="organisator")
		// show courses with no organisator
		find = _.extend(find, {$where: "this.roles.team && this.roles.team.subscribed.length == 0"});
	if(listparameters.missing=="subscribers")
		// show courses with not enough subscribers
		find = _.extend(find, {$where: "this.roles.participant && this.roles.participant.subscribed.length < this.subscribers_min"} );
	return Courses.find(find, {sort: {time_lastedit: -1, time_created: -1}});
}

/* ------------------------- List types / Templates ------------------------- */



  Template.courselist.courses = function () {
  // needed to actualize courses
   return this.courses;
  };

  // Template handlers ---------------
  Template.courselist.coursesLoaded = function () {
    return Session.get('coursesLoaded');
  };
  Template.coursepage.coursesLoaded = function () {
    return Session.get('coursesLoaded');
  };

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

// alle regionen abfragen bei folgender funktion:

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
	if (this.subscribers_min < 1) return 'ontheway'
	var ratio = this.roles.participant.subscribed.length / this.subscribers_min
	if (ratio < 0.5) return 'no'
	if (ratio >= 1) return 'yes'
	return 'ontheway'
}

Template.course.team_status = function() {
	return this.roles.team.subscribed.length > 0 ? 'yes' : 'no'
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

Template.course.is_team = function() {
	return this.roles.team.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}

Template.course.is_mentor = function() {
	return this.roles.mentor.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}


Template.course.categorynames = function() {
	return Categories.find({_id: {$in: course.categories}}).map(function(cat) { return cat.name }).join(', ')
}
