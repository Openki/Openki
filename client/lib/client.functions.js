
havingRole = function(members, role) {
	return _.reduce(members, function(ids, member) {
		if (member.roles.indexOf(role) !== -1) {
			ids.push(member.user);
		}
		return ids;
	}, []);
};

getMember = function(members, user) {
	if (!members) return false;
	var member = false;
	members.forEach(function(member_candidate) {
		if (member_candidate.user == user) {
			member = member_candidate;
			return true; // break
		}
	});
	return member;
};


mayEdit = function(user, course) {
	if(!user) return false;
	return user && (privileged(user, 'admin') || hasRoleUser(course.members, 'team', user._id));
};


/* Get a username from ID
 * 
 * It tries hard to give a sensible response; incognito ids get represented by an incognito string, unless the user employing that incognito-ID is currently logged in.
 */
userName = function(userId) {
	if (!userId) return mf('noUser_placeholder', 'someone');
	
	if (userId.substr(0, 5)  == 'Anon_') {
		var loggeduser = Meteor.user();
		if (loggeduser && loggeduser.anonId && loggeduser.anonId.indexOf(userId) != -1) {
			return  '☔ ' + loggeduser.username + ' ☔';
		}
		return "☔ incognito";
	}
	
	// This seems extremely wasteful
	// But the alternatives are more complicated by a few orders of magnitude
	miniSubs.subscribe('user', userId);
	
	var user = Meteor.users.findOne({ _id: userId });
	if (user) {
		if (user.username) {
			return user.username;
		} else {
			return "userId: " + user._id;
		}
	} 
		
	return "No_User";
};


/* Go to the same page removing query parameters */
goBase = function() {
	Router.go(Router.current().route.name, Router.current().params); // Shirely, you know of a better way?
};


pleaseLogin = function() {
	if (Meteor.userId()) return false;
	alert(mf('Please.login', 'Please login or register'));
	setTimeout(function(){
		$('.loginButton').dropdown('toggle');  	//or $('.dropdown').addClass('open');
	},0);
	return true;
};












/*************** HandleBars Helpers ***********************/

Handlebars.registerHelper ("categoryName", function(cat) {
	cat = cat || this;
	Session.get('locale'); // Reactive dependency
	return mf('category.'+this);
});

Handlebars.registerHelper ("privacyEnabled", function(){
	var user = Meteor.user();
	if(!user) return false;
	return user.privacy;
});


Handlebars.registerHelper("log", function(context) {
	if (window.console) console.log(arguments.length > 0 ? context : this);
});


Handlebars.registerHelper('username', userName);


Handlebars.registerHelper('dateformat', function(date) {
	Session.get('timeLocale');
	if (date) return moment(date).format('L');
});

Handlebars.registerHelper('dateLong', function(date) {
	if (date) {
		Session.get('timeLocale');
		date = moment(moment(date).toDate());
		return moment(date).format('LL');
	}
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
	Session.get('timeLocale');
	if (date) return moment(date).format('LT');
});

Handlebars.registerHelper('fromNow', function(date) {
	Session.get('fineTime');
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).fromNow();
});


Handlebars.registerHelper('isNull', function(val) {
	return val === null;
});

Handlebars.registerHelper('courseURL', function(_id) {
	var course=Courses.findOne(_id);
	var name = getSlug(course.name);
	return '/course/' + _id + '/' + name;
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

// http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
/**
 * Get the parent template instance
 * @param {Number} [levels] How many levels to go up. Default is 1
 * @returns {Blaze.TemplateInstance}
 */

Blaze.TemplateInstance.prototype.parentInstance = function (levels) {
    var view = Blaze.currentView;
    if (typeof levels === "undefined") {
        levels = 1;
    }
    while (view) {
        if (view.name.substring(0, 9) === "Template." && !(levels--)) {
            return view.templateInstance();
        }
        view = view.parentView;
    }
};

Handlebars.registerHelper('groupShort', function(groupId) {
	var instance = Template.instance();
	instance.subscribe('group', groupId);

	var group = Groups.findOne({ _id: groupId });
	if (group) return group.short;
	return "";
});

Handlebars.registerHelper('groupLogo', function(groupId) {
	var instance = Template.instance();
	instance.subscribe('group', groupId);

	var group = Groups.findOne({ _id: groupId });
	if (group) {
		if (group.logo){
			return group.logo;
		} return "";
	}
	return "";
});
