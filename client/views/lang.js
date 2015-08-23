var lgs = {
	'ar': { lg: 'ar', name: 'العربية', short: 'العربية'},
	'de': { lg: 'de', name: 'Deutsch', short: 'de'},
	'en': { lg: 'en', name: 'English', short: 'en'},
	'es': { lg: 'es', name: 'Castellano', short: 'es'},
	'fr': { lg: 'fr', name: 'Français', short: 'fr'},
	'it': { lg: 'it', name: 'Italiano', short: 'it'},
	'da': { lg: 'da', name: 'Dansk', short: 'da'},
	'zh_TW': { lg: 'zh_TW', name: '國語', short: '國語'}
};

Template.lang_sel.helpers({
	lgs: function() {
		return _.values(lgs);
	},

	short: function() {
		return lgs[Session.get('locale')].short;
	}

});

Template.lang_sel.events({
	'click a.langselect': function(e){
		mfPkg.setLocale(this.lg);
		localStorage.setItem('locale', this.lg);
		Session.set('locale', this.lg);
		e.preventDefault();
		if (Meteor.user()){
			Meteor.call('updateUserLocale', this.lg);
		}
	}
});

// Always load english translation
// For dynamically constructed translation strings there is no default 
// translation and meteor would show the translation key if there is no
// translation in the current locale
mfPkg.loadLangs('en');  
