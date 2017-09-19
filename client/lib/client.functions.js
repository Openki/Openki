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


/* Get a username from ID
 */
userName = function() {
	// We cache the username lookups
	// To prevent unlimited cache-growth, after a enough lookups we
	// build a new cache from the old
	var cacheLimit = 1000;
	var cache = {};
	var previousCache = {};
	var lookups = 0;
	var pending = {};

	// Update the cache if users are pushed to the collection
	Meteor.users.find().observe({
		'added': function(user) {
			cache[user._id] = user.username;
		},
		'changed': function(user) {
			cache[user._id] = user.username;
		}
	});

	return function(userId) {
		if (!userId) return mf('noUser_placeholder', 'someone');

		// Consult cache
		var user = cache[userId];
		if (user === undefined) {
			// Consult old cache
			user = previousCache[userId];

			// Carry to new cache if it was present in the old
			if (user !== undefined) {
				cache[userId] = user;
			}
		}

		if (user === undefined) {
			// Substitute until the name (or its absence) is loaded
			user = '?!';

			if (pending[userId]) {
				pending[userId].depend();
			} else {
				// Cache miss, now we'll have to round-trip to the server
				lookups += 1;
				pending[userId] = new Tracker.Dependency();
				pending[userId].depend();

				// Cycle the cache if it's full
				if (cacheLimit < lookups) {
					previousCache = cache;
					cache = {};
					lookups = 0;
				}

				Meteor.call('user.name', userId, function(err, user) {
					if (err) {
						console.warn(err);
					}
					if (user) {
						cache[userId] = user;
						pending[userId].changed();
						delete pending[userId];
					}
				});
			}
		}

		if (user) {
			return user;
		} else {
			return "userId: " + userId;
		}
	};
}();


/* Go to the same page removing query parameters */
goBase = function() {
	Router.go(Router.current().route.name, Router.current().params); // Shirely, you know of a better way?
};


pleaseLogin = function() {
	if (Meteor.userId()) return false;
	alert(mf('Please.login', 'Please login or register'));

	var viewportWidth = Session.get('viewportWidth');
	if (viewportWidth <= SCSSVars.gridFloatBreakpoint) {
		$('.collapse').collapse('show');
	}

	setTimeout(function(){
		$('.loginButton').dropdown('toggle');    //or $('.dropdown').addClass('open');
	},0);
	return true;
};

markedName = function(search, name) {
	if (search === '') return name;
	var match = name.match(new RegExp(search, 'i'));

	// To add markup we have to escape all the parts separately
	var marked;
	if (match) {
		var term = match[0];
		var parts = name.split(term);
		marked = _.map(parts, Blaze._escape).join('<strong>'+Blaze._escape(term)+'</strong>');
	} else {
		marked = Blaze._escape(name);
	}
	return Spacebars.SafeString(marked);
};

getViewportWidth = function() {
	var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	Session.set('viewportWidth', viewportWidth);
};

showServerError = function(message, err) {
	addMessage(mf('_serverError', { ERROR: err, MESSAGE: message}, 'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.'), 'danger');
};

var subbedGroup = function(group) {
	var groupId = ''+group; // it's not a string?! LOL I DUNNO
	miniSubs.subscribe('group', groupId);
	return Groups.findOne(groupId);
};


groupNameHelpers = {
	short: function() {
		if (!this) return;
		var group = subbedGroup(this);
		if (!group) return "-";
		return group.short;
	},
	name: function() {
		if (!this) return;
		var group = subbedGroup(this);
		if (!group) return mf('group.missing', "Group does not exist");
		return group.name;
	},
};

/** Use null instead of 'all' to mean "All regions".
  * This is needed until all instances where we deal with regions are patched.
  */
cleanedRegion = function(region) {
	return region === 'all' ? null : region;
};

TemplateMixins = {
	/** Setup expand/collaps logic for a template
	*
	* @param {Object} template instance
	*
	* This mixin extends the given template with an `expanded` helper and
	* two click handlers `js-expand` and `js-close`. Only one expandible template
	* can be open at a time, so don't nest them.
	*
	* Example:
	* <template name="pushIt">
	*   <div>
	*     {{#if expanded}}
	*       All this content hiding here.
	*       Now close it again!
	*       <button type="button" class="js-collapse">CLOSE IT!</button>
	*     {{else}}
	*       Press the button!
	*       <button type="button" class="js-expand">OPEN IT!</button>
	*     {{/if}}
	*   </div>
	* </template>
	*/
	Expandible: function(template) {
		template.onCreated(function() {
			var expander = Random.id(); // Token to keep track of which Expandible is open
			this.expander = expander; // Read by event handlers
			this.collapse = function() {
				if (Session.equals('verify', expander)) {
					Session.set('verify', false);
				}
			};
		});
		template.helpers({
			'expanded': function() {
				return Session.equals('verify', Template.instance().expander);
			}
		});
		template.events({
			'click .js-expand': function(event, instance) {
				Session.set('verify', instance.expander);
				event.stopPropagation();
			},
			'click .js-collapse': function(event, instance) {
				Session.set('verify', false);
			},
		});
	},

	/** Like Expandible but multiple expandibles can be open at the same time. */
	MultiExpandible: function(template) {
		var dx = -1000;
		var dy = -1000;
		var nomove = function(e) {
			return Math.abs(dx - e.screenX) < 5 && Math.abs(dy - e.screenY) < 5;
		};

		template.onCreated(function() {
			this.expanded = new ReactiveVar(false);
		});
		template.helpers({
			'expanded': function() {
				return Template.instance().expanded.get();
			}
		});
		template.events({
			'mousedown': function(event) {
				dx = event.screenX;
				dy = event.screenY;
			},
			'mouseup .js-expand': function(event, instance) {
				if (nomove(event)) {
					instance.expanded.set(true);
				}
			},
			'mouseup .js-collapse': function(event, instance) {
				if (nomove(event)) {
					instance.expanded.set(false);
				}
			},
		});
	},
};


/*************** HandleBars Helpers ***********************/

Template.registerHelper ("siteName", function() {
	if (Meteor.settings.public && Meteor.settings.public.siteName) {
		return Meteor.settings.public.siteName;
	}
	return "Hmmm";
});

Template.registerHelper ("siteStage", function() {
	if (Meteor.settings.public && Meteor.settings.public.siteStage) {
		return Meteor.settings.public.siteStage;
	}
	return "";
});


Template.registerHelper ("categoryName", function() {
	Session.get('locale'); // Reactive dependency
	return mf('category.'+this);
});

Template.registerHelper ("privacyEnabled", function(){
	var user = Meteor.user();
	if(!user) return false;
	return user.privacy;
});


Template.registerHelper("log", function(context) {
	if (window.console) console.log(arguments.length > 0 ? context : this);
});


Template.registerHelper('username', userName);


Template.registerHelper('currentLocale', function() {
	return Session.get('locale');
});

Template.registerHelper('now', function(){
	return moment(new Date());
});

Template.registerHelper('backArrow', function() {
	var isRTL = Session.get('textDirectionality') == 'rtl';
	var direction = isRTL ? 'right' : 'left';
	return Spacebars.SafeString(
		'<span class="fa fa-arrow-' + direction + ' fa-fw" aria-hidden="true"></span>'
	);
});

Template.registerHelper('dateformat', function(date) {
	Session.get('timeLocale');
	if (date) return moment(date).format('L');
});

Template.registerHelper('dateLong', function(date) {
	if (date) {
		Session.get('timeLocale');
		date = moment(moment(date).toDate());
		return moment(date).format('LL');
	}
});

Template.registerHelper('weekNr', function(date) {
	if (date) {
		Session.get('timeLocale');
		date = moment(moment(date).toDate());
		return moment(date).week();
	}
});


Template.registerHelper('dateformat_calendar', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).calendar();
});

Template.registerHelper('dateformat_withday', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('ddd D.MM.YYYY');
});

Template.registerHelper('weekday', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('dddd');
});

Template.registerHelper('weekday_short', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('ddd');
});

Template.registerHelper('dateformat_fromnow', function(date) {
	Session.get('fineTime');
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).fromNow();
});

Template.registerHelper('fullDate', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).format('ddd D.MM.YYYY HH:mm');
});


Template.registerHelper('dateformat_mini', function(date) {
	if (date) return moment(date).format('D.M.');
});

Template.registerHelper('dateformat_mini_fullmonth', function(date) {
	Session.get('timeLocale'); // it depends
	if (date) {
		var m = moment(date);
		var year = m.year() != moment().year() ? " " + m.format('YYYY') : '';
		return moment(date).format('D. MMMM') + year;
	}
});

Template.registerHelper('timeformat', function(date) {
	Session.get('timeLocale');
	if (date) return moment(date).format('LT');
});

Template.registerHelper('fromNow', function(date) {
	Session.get('fineTime');
	Session.get('timeLocale'); // it depends
	if (date) return moment(date).fromNow();
});


Template.registerHelper('isNull', function(val) {
	return val === null;
});

Template.registerHelper('courseURL', function(_id) {
	var course=Courses.findOne(_id);
	var name = getSlug(course.name);
	return '/course/' + _id + '/' + name;
});


// Strip HTML markup
Template.registerHelper('plain', function(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
});

// Take a plain excerpt from HTML text
// If the output is truncated to len, an ellipsis is added
Template.registerHelper('plainExcerpt', function(html, len) {
	html = html || '';
	var div = document.createElement('div');
	div.innerHTML = html;
	var s = div.textContent || div.innerText || '';

	// Condense runs of whitespace so counting characters won't be too far off
	s = s.replace(/\s+/, " ");

	if (s.length <= len) return s;
	return s.substring(0, len)+'…';
});

Template.registerHelper ("venueName", function(venueId) {
	var venue = Venues.findOne(venueId);
	if (!venue) return '';
	return venue.name;
});

// http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
/** Get the parent template instance
  * @param {Number} [levels] How many levels to go up. Default is 1
  * @returns {Blaze.TemplateInstance}
  */
Blaze.TemplateInstance.prototype.parentInstance = function(levels) {
	var view = this.view;
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


/** Set the business of the template instance
  *
  * This method will set up the 'business' variable on the template instance.
  * It needs to be called in onCreated() so the other methods will find the
  * var. Usually it will be this.busy(false) bout it could also be
  * this.busy('loading') for example.
  *
  * @param {String} [activity] The new business
  */
Blaze.TemplateInstance.prototype.busy = function (activity) {
	if (!this.business) {
		this.business = new ReactiveVar(activity);
	} else {
		this.business.set(activity);
	}
};


/** Find business state var in this or parent template instance
  */
Blaze.TemplateInstance.prototype.findBusiness = function() {
	if (this.business) return this.business; // Short-circuit common case

	var businessInstance = this;
	while (businessInstance && !businessInstance.business) {
		businessInstance = businessInstance.parentInstance();
	}

	if (!businessInstance) {
		throw "Unable to find parent instance with business set";
	}

	// Cache on the local instance
	this.business = businessInstance.business;

	return this.business;
};


/** Compare activity to template business
  * This can be used to show a busy state while the template is working.
  *
  * Example: <button>{#if busy 'saving'}Saving...{else}Save now!{/if}</button>
  *
  * @param {String} [activity] compare to this activity
  * @returns {Bool} Whether business matches activity
  */
Template.registerHelper('busy', function(activity) {
	var business = Template.instance().findBusiness();
	return business.get() == activity;
});


/** Disable buttons while there is business to do.
  *
  * Example <button {disableIfBusy}>I will be disabled when there is business.</button>
  *
  * @return {String} 'disabled' if the template is currently busy, empty string otherwise.
  */
Template.registerHelper('disabledIfBusy', function() {
	var business = Template.instance().findBusiness();
	return business.get() ? 'disabled' : '';
});


Template.registerHelper('groupShort', function(groupId) {
	var instance = Template.instance();
	instance.subscribe('group', groupId);

	var group = Groups.findOne({ _id: groupId });
	if (group) return group.short;
	return "";
});

Template.registerHelper('groupLogo', function(groupId) {
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

/** Return the instance for use in the template
  * This can be used to directly access instance methods without declaring
	* helpers.
	*/
Template.registerHelper('$instance', function() {
	return Template.instance();
});
