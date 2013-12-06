// Timestamp, das muss man eigentlich auf der Serverseite machen,
// damit mans nicht faken kann?? Noch anschauen.
get_timestamp = function (){
	var now = new Date();
	return now.getTime();
}


display_coursename = function (courseid){
  var course = Courses.findOne({_id:courseid});
  if(course){
    return course.name;
  }else{
    return "dummdididumm.."
  }
}



/*************** HandleBars Helpers ***********************/

Handlebars.registerHelper("log", function(context) {
	if (window.console) console.log(context)
});

Handlebars.registerHelper("title", function() {
	var les = Array.prototype.slice.call(arguments, 0, -1)
	document.title = les.join("");
});

Handlebars.registerHelper('username', function (userid){
  var user= Meteor.users.findOne({_id:userid});
  if(user){
    if(user.username){
    	  return user.username;
    }else{
    	  return "userid: "+user._id; // solange .username noch nix ist, haben wir nur die _id...
    }
  }else{
      console.log('username is: ' + user)  //  <--------------------------------------------------<<<<<<<<<<<
      return "No_User";
  }
})


Handlebars.registerHelper('dateformat', function(date) {
	// We'll need a date formatter at some point
	//if (date) return date.toDateString();
    if (date) return date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear();
});


Handlebars.registerHelper('timeformat', function(date) {
    // We'll need a time formatter at some point
    //if (date) return date.toTimeString();

    if (date) return ("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2);
});


Handlebars.registerHelper('isNull', function(val) {
    return val === null
});

Handlebars.registerHelper('courseURL', function(_id, name) {
	var name = name.replace(/[^\w\s]/gi, '-').replace(/[_\s]/g, '_')
	var _id = _id
	return 'course/' + _id + '/' + name;
});


						//Html title attribute of participant-state-sybol in courselist
Handlebars.registerHelper('isYes', function(val) {
 	return val === 'yes'
});
Handlebars.registerHelper('isOntheway', function(val) {
 	return val === 'ontheway'
});


Handlebars.registerHelper('isAdmin', function() {
    var user = Meteor.user()
    return user && user.isAdmin
});

