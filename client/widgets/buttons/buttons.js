Template.buttonSave.helpers({
	'disabled': function() {
		if (this.saving) return 'disabled';
	}
});
