
havingRole = function(members, role) {
	return _.reduce(members, function(ids, member) {
		if (member.roles.indexOf(role) !== -1) ids.push(member.user)
			return ids;
	}, [])
}

getMember = function(members, user) {
	if (!members) return false;
	var member = false;
	members.forEach(function(member_candidate) {
		if (member_candidate.user == user) {
			member = member_candidate
			return true; // break
		}
	})
	return member;
}


mayEdit = function(user, course){
	if(!user)
		return false;
	return user && (privileged(user, 'admin') || hasRoleUser(course.members, 'team', user._id))
}



/* Get a username from ID
 * 
 * It tries hard to give a sensible response; incognito ids get represented by an incognito string, unless the user employing that incognito-ID is currently logged in.
 */
userName = function(userId) {
	if (!userId) return '';
	
	if (userId.substr(0, 5)  == 'Anon_') {
		var loggeduser = Meteor.user();
		if (loggeduser && loggeduser.anonId && loggeduser.anonId.indexOf(userId) != -1) {
			return  '☔ ' + loggeduser.username + ' ☔';
		}
		return "☔ incognito";
	}
	
	// This seems extremely wasteful
	// But the alternatives are more complicated by a few orders of magnitude
	var tpl = Template.instance();
	tpl.subscribe('user', userId);
	
	var user = Meteor.users.findOne({ _id: userId });
	if (user) {
		if (user.username) {
			return user.username;
		} else {
			return "userId: " + user._id;
		}
	} 
		
	return "No_User";
}


/* Go to the same page removing query parameters */
goBase = function() {
	Router.go(Router.current().route.name, Router.current().params) // Shirely, you know of a better way?
}


pleaseLogin = function() {
	if (Meteor.userId()) return false;
	alert(mf('Please.login', 'Please login or register'));
	setTimeout(function(){
		$('.loginButton').dropdown('toggle');  	//or $('.dropdown').addClass('open');
	},0);
	return true;
}












/*************** HandleBars Helpers ***********************/

Handlebars.registerHelper ("categoryName", function(cat) {
	cat = cat || this;
	return mf('category.'+this);
});

Handlebars.registerHelper ("privacyEnabled", function(){
	var user = Meteor.user();
	if(!user)
		return false;
	return user.privacy
	// return user && (user.privacy || course.privacy)   //TODO: send course etc aswell
});


Handlebars.registerHelper("log", function(context) {
	if (window.console) console.log(arguments.length > 0 ? context : this);
});

Handlebars.registerHelper("title", function() {
	var les = Array.prototype.slice.call(arguments, 0, -1)
	document.title = les.join("");
});

Handlebars.registerHelper('username', userName);


Handlebars.registerHelper('dateformat', function(date) {
	// We'll need a date formatter at some point
	//if (date) return date.toDateString();

	if (date) return date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear();
});

Handlebars.registerHelper('dateformat_calendar', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).calendar();
});

Handlebars.registerHelper('dateformat_withday', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('ddd D.MM.YYYY');
});

Handlebars.registerHelper('weekday', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('dddd');
});

Handlebars.registerHelper('weekday_short', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('ddd');
});

Handlebars.registerHelper('dateformat_fromnow', function(date) {
	Session.get('fineTime');
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).fromNow();
});

Handlebars.registerHelper('fullDate', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('ddd D.MM.YYYY HH:mm');
});


Handlebars.registerHelper('dateformat_mini', function(date) {
	if (date) return moment(date).format('D.M.');
});

Handlebars.registerHelper('dateformat_mini_fullmonth', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('D. MMMM');
});

Handlebars.registerHelper('timeformat', function(date) {
	if (date) return moment(date).format('HH:mm');
});

Handlebars.registerHelper('fromNow', function(date) {
	Session.get('fineTime');
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).fromNow();
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


// Strip HTML markup
Handlebars.registerHelper('plain', function(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
});

Handlebars.registerHelper ("locationName", function(loc) {
	var location = Locations.findOne(loc);
	if (!location) return 'LocationNotFound';
	return location.name;
});
