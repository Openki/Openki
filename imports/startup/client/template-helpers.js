import { Template } from 'meteor/templating';
import Groups from '/imports/api/groups/groups.js';


const helpers = {
	siteName() {
		if (Meteor.settings.public && Meteor.settings.public.siteName) {
			return Meteor.settings.public.siteName;
		}
		return "Hmmm";
	},

	categoryName() {
		Session.get('locale'); // Reactive dependency
		return mf('category.'+this);
	},

	log(context) {
		if (window.console) console.log(arguments.length > 0 ? context : this);
	},

	dateformat(date) {
		Session.get('timeLocale');
		if (date) return moment(date).format('L');
	},

	dateLong(date) {
		if (date) {
			Session.get('timeLocale');
			date = moment(moment(date).toDate());
			return moment(date).format('LL');
		}
	},

	dateformat_mini_fullmonth(date) {
		Session.get('timeLocale'); // it depends
		if (date) {
			var m = moment(date);
			var year = m.year() != moment().year() ? " " + m.format('YYYY') : '';
			return moment(date).format('D. MMMM') + year;
		}
	},

	timeformat(date) {
		Session.get('timeLocale');
		if (date) return moment(date).format('LT');
	},

	fromNow(date) {
		Session.get('fineTime');
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).fromNow();
	},

	weekdayShort(date) {
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).format('ddd');
	},

	// Strip HTML markup
	plain(html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent || div.innerText || '';
	},

	/** Compare activity to template business
	  * This can be used to show a busy state while the template is working.
	  *
	  * Example: <button>{#if busy 'saving'}Saving...{else}Save now!{/if}</button>
	  *
	  * @param {String} [activity] compare to this activity
	  * @returns {Bool} Whether business matches activity
	  */
	busy(activity) {
		var business = Template.instance().findBusiness();
		return business.get() == activity;
	},

	/** Disable buttons while there is business to do.
	  *
	  * Example <button {disableIfBusy}>I will be disabled when there is business.</button>
	  *
	  * @return {String} 'disabled' if the template is currently busy, empty string otherwise.
	  */
	disabledIfBusy() {
		var business = Template.instance().findBusiness();
		return business.get() ? 'disabled' : '';
	},

	state(state) {
		return Template.instance().state.get(state);
	},

	groupLogo(groupId) {
		var instance = Template.instance();
		instance.subscribe('group', groupId);

		var group = Groups.findOne({ _id: groupId });
		if (group) {
			if (group.logo){
				return group.logo;
			} return "";
		}
		return "";
	},

	/** Return the instance for use in the template
	  * This can be used to directly access instance methods without declaring
		* helpers.
		*/
	instance() {
		return Template.instance();
	}
};

for (const name in helpers) {
	Template.registerHelper(name, helpers[name]);
}

/* Get a username from ID
 */
const usernameFromId = function() {
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
			user = '◌';

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
					cache[userId] = user ? user : '?!';
					pending[userId].changed();
					delete pending[userId];
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

Template.registerHelper('username', usernameFromId);
