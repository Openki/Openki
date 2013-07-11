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

Handlebars.registerHelper('username', function (userid){
  var user= Meteor.users.findOne({_id:userid});
  if(user){
    if(user.username){
    	  return user.username;
    }else{
    	  return "userid: "+user._id; // solange .username noch nix ist, haben wir nur die _id...
    }
  }else{
      return "serverscript";
  }
})


Handlebars.registerHelper('dateformat', function(date) {
	/* We'll need a date formatter at some point */
	if (date) return date.toDateString();
});

//checks categories database for each course!
//better would be: fetch categories database first and only once..
//TO DO!

display_categoryname= function (categoryid){
  var categoryname= Categories.findOne(categoryid).name;
      return categoryname;
}


display_category= function (id){
  var category= Categories.findOne({_id:id});
    return category.name;
}

var trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

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
        default:
            return options.inverse(this)
            break;
    }
    //return options.inverse(this);
});

Handlebars.registerHelper('isNotNull', function(val) {
    return val !== null
});
