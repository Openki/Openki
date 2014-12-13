Template.editable.created = function() {
	this.changed = new ReactiveVar(false);
}

Template.editable.rendered = function() {
	var self = this;
	var editable = this.$('.editable');
	new MediumEditor(editable); /* { disableReturn: true, disableToolbar: true } */
	editable.on('input', function() {
		self.changed.set(true);
	});
}

Template.editable.helpers({
	changed: function() { return Template.instance().changed.get() }
});

Template.editable.events({
	'click .editable-store': function(event, instance) {
		instance.data.store(instance.$('.editable').html(), function() { instance.changed.set(false); });
		//instance.$('.editable').html('')
	},
	'click .editable-cancel': function(event, instance) { 
		instance.$('.editable').html(instance.data.text);
		instance.changed.set(false);
	}
});
