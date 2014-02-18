// Timestamp, das muss man eigentlich auf der Serverseite machen,
// damit mans nicht faken kann?? Noch anschauen.
get_timestamp = function (){
	var now = new Date();
	return now.getTime();
}

hasRole = function(members, role) {
	var has = false;
	members.forEach(function(member) {
		if (member.roles.indexOf(role) !== -1) {
			has = true;
			return true;
		}
	})
	return has;
}

havingRole = function(members, role) {
	return _.reduce(members, function(ids, member) {
		if (member.roles.indexOf(role) !== -1) ids.push(member.user)
			return ids;
	}, [])
}

getMemeber = function(members, user) {
	var member = false;
	members.forEach(function(member_candidate) {
		if (member.user == user) {
			member = member_candidate
			return true; // break
		}
	})
	return member;
}

hasRoleUser = function(members, role, user) {
	var has = false;
	members.forEach(function(member) {
		if (member.user == user) {
			has = member.roles.indexOf(role) !== -1
			return true; // break
		}
	})
	return has;
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
		if (userid.substr(0, 5)  == 'Anon_'){
			return "Anonymous☔";
		}else{
			return "No_User";
		}

	}
})


Handlebars.registerHelper('dateformat', function(date) {
    // We'll need a date formatter at some point
    //if (date) return date.toDateString();

    if (date) return date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear();
});

Handlebars.registerHelper('dateformat_withday', function(date) {
    // We'll need a date formatter at some point
    //if (date) return date.toDateString();
    horrible_date_array=["Mo","Tue","Wed","Thu","Fr","Sat","So"]; //FIXME

    if (date) return horrible_date_array[date.getDay()]+". "+date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear();
});


Handlebars.registerHelper('dateformat_mini', function(date) {
    // We'll need a date formatter at some point
    //if (date) return date.toDateString();
    if (date) return date.getDate()+"."+(date.getMonth()+1)+".";
});


Handlebars.registerHelper('timeformat', function(date) {
    // We'll need a time formatter at some point
    //if (date) return date.toTimeString();

    if (date) return ("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2);
});


Handlebars.registerHelper('isNull', function(val) {
    return val === null
});

Handlebars.registerHelper('courseURL', function(_id) {
    var course=Courses.findOne(_id);
    var name = getSlug(course.name);
	//var name = course.name.replace(/[^\w\s]/gi, '-').replace(/[_\s]/g, '_')
	var _id = _id
	return '/course/' + _id + '/' + name;
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
    error.log(user.isAdmin)
    return user && user.isAdmin
});

