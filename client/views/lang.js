Template.lang_sel.helpers({
	lgs: function() {
		return [{ lg: 'en'}, { lg: 'de'}, { lg: 'fr'}, { lg: 'it'}];
	},
	
	lg: function() {
		var lg = Session.get('locale')
		return lg ? lg : 'en';
	}
});

Template.lang_sel.events({
	'click a.langselect': function(e){
		Session.set('locale', this.lg);
		e.preventDefault();
	}
})
