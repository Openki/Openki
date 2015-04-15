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
		mfPkg.ready();
		e.preventDefault();
	}
});
