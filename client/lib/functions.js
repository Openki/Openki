// Timestamp, das muss man eigentlich auf der Serverseite machen,
// damit mans nicht faken kann?? Noch anschauen.
get_timestamp = function (){
	var now = new Date();
	return now.getTime();
}

format_date= function (date){
	var d= new Date(date);
	var curr_date = d.getDate();
	var curr_month = d.getMonth() + 1; //Months are zero based
	var curr_year = d.getFullYear();
	var date_string=curr_date + "." + curr_month + "." + curr_year;
	return date_string;
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
	if (window.console) return console.log(context);
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


var trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

Handlebars.registerHelper('ifCond', function (v1, operator, v2) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? true : false;
            break;
        case '===':
            return (v1 === v2) ? true : false;
            break;
    }
    //return options.inverse(this);
});

Handlebars.registerHelper('unlessCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
            break;
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
            break;
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
            break;
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            break;
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
            break;
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            break;
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
            break;
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
            break;
        default:
            return options.inverse(this)
            break;
    }
    //return options.inverse(this);
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

/*
Handlebars.registerHelper('isAdmin', function() {
    var user = Meteor.user()
    error.log(user.isAdmin)
    return user && user.isAdmin
});
*/