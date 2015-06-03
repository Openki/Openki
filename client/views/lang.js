Template.lang_sel.helpers({
	lgs: function() {
		return [ {lg:'ar'}, { lg: 'de'}, { lg: 'en'}, {lg:'es'}, { lg: 'fr'}, { lg: 'it'}, {lg: 'zh_TW'}];
	},
	
	lg: function() {
		var lg = Session.get('locale')
		return lg ? lg : 'en';
	}
});

Template.lang_sel.events({
	'click a.langselect': function(e){
		mfPkg.setLocale(this.lg);
		e.preventDefault();
	}
});

// Always load english translation
// For dynamically constructed translation strings there is no default 
// translation and meteor would show the translation key if there is no
// translation in the current locale
mfPkg.loadLangs('en');  