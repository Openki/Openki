import Profile from '/imports/utils/profile.js';

UpdatesAvailable['2017.10.02 ensureAcceptsMessages'] = function() {
	return Profile.updateAcceptsMessages({});
};
