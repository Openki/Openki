import { Template } from 'meteor/templating';
import Groups from '/imports/api/groups/groups';


const helpers = {
	siteName() {
		if (Meteor.settings.public && Meteor.settings.public.siteName) {
			return Meteor.settings.public.siteName;
		}
		return 'Hmmm';
	},

	categoryName() {
		Session.get('locale'); // Reactive dependency
		return mf(`category.${this}`);
	},

	guideLink() {
		const locale = Session.get('locale');
		// default fallback language
		let guideLink = 'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf';

		switch (locale) {
		case 'de':
			guideLink = 'https://about.openki.net/wp-content/uploads/2019/05/Wie-organisiere-ich-ein-Openki-Treffen.pdf';
			break;
		case 'en':
			guideLink = 'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf';
			break;
		default:
			guideLink = 'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf';
			break;
		}
		return guideLink;
	},

	log(context) {
		if (window.console) {
			/* eslint-disable-next-line no-console */
			console.log(arguments.length > 0 ? context : this);
		}
	},

	// eslint-disable-next-line consistent-return
	dateformat(date) {
		Session.get('timeLocale');
		if (date) return moment(date).format('L');
	},

	dateLong(date) {
		if (date) {
			Session.get('timeLocale');
			return moment(date).format('LL');
		}
		return false;
	},

	dateShort(date) {
		if (date) {
			Session.get('timeLocale');
			return moment(date).format('l');
		}
		return false;
	},

	// eslint-disable-next-line consistent-return
	dateformat_mini_fullmonth(date) {
		Session.get('timeLocale'); // it depends
		if (date) {
			const m = moment(date);
			const year = m.year() !== moment().year() ? ` ${m.format('YYYY')}` : '';
			return moment(date).format('D. MMMM') + year;
		}
	},

	// eslint-disable-next-line consistent-return
	timeformat(date) {
		Session.get('timeLocale');
		if (date) return moment(date).format('LT');
	},

	// eslint-disable-next-line consistent-return
	fromNow(date) {
		Session.get('fineTime');
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).fromNow();
	},

	// eslint-disable-next-line consistent-return
	weekdayShort(date) {
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).format('ddd');
	},

	// Strip HTML markup
	plain(html) {
		const div = document.createElement('div');
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
		const business = Template.instance().findBusiness();
		return business.get() === activity;
	},

	/** Disable buttons while there is business to do.
	  *
	  * Example <button {disableIfBusy}>I will be disabled when there is business.</button>
	  *
	  * @return {String} 'disabled' if the template is currently busy, empty string otherwise.
	  */
	disabledIfBusy() {
		const business = Template.instance().findBusiness();
		return business.get() ? 'disabled' : '';
	},

	state(state) {
		return Template.instance().state.get(state);
	},

	groupLogo(groupId) {
		const instance = Template.instance();
		instance.subscribe('group', groupId);

		const group = Groups.findOne({ _id: groupId });
		if (group) {
			if (group.logoUrl) {
				return group.logoUrl;
			} return '';
		}
		return '';
	},

	/** Return the instance for use in the template
	  * This can be used to directly access instance methods without declaring
		* helpers.
		*/
	instance() {
		return Template.instance();
	},
};

Object.keys(helpers).forEach(name => Template.registerHelper(name, helpers[name]));

/* Get a username from ID
 */
const usernameFromId = (function () {
	// We cache the username lookups
	// To prevent unlimited cache-growth, after a enough lookups we
	// build a new cache from the old
	const cacheLimit = 1000;
	let cache = {};
	let previousCache = {};
	let lookups = 0;
	const pending = {};

	// Update the cache if users are pushed to the collection
	Meteor.users.find().observe({
		added(user) {
			cache[user._id] = user.username;
		},
		changed(user) {
			cache[user._id] = user.username;
		},
	});

	return function (userId) {
		if (!userId) return mf('noUser_placeholder', 'someone');

		// Consult cache
		let cachedUser = cache[userId];
		if (cachedUser === undefined) {
			// Consult old cache
			cachedUser = previousCache[userId];

			// Carry to new cache if it was present in the old
			if (cachedUser !== undefined) {
				cache[userId] = cachedUser;
			}
		}

		if (cachedUser === undefined) {
			// Substitute until the name (or its absence) is loaded
			cachedUser = '◌';

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

				Meteor.call('user.name', userId, (err, user) => {
					if (err) {
						/* eslint-disable-next-line no-console */
						console.warn(err);
					}
					cache[userId] = user || '?!';
					pending[userId].changed();
					delete pending[userId];
				});
			}
		}

		if (cachedUser) {
			return cachedUser;
		}
		return `userId: ${userId}`;
	};
}());

Template.registerHelper('username', usernameFromId);
