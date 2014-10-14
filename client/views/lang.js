Template.lang_sel.helpers({
	lgs: function() {
		return [{ lg: 'en'}, { lg: 'de'}];
	},
	
	lg: function() {
		var lg = Session.get('locale')
		return lg ? lg : 'en';
	}
});

Template.lang_sel.events({
	'click a.langselect': function(){
		Session.set('locale', this.lg)
		return false;
	}
})

