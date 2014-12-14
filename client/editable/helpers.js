Template.editable.created = function() {
	this.changed = new ReactiveVar(false);
}

Template.editable.rendered = function() {
	var self = this;
	var editable = this.$('.editable');
	options = {};
	if (this.data.simple) {
		options.disableReturn = true;
		options.disableToolbar = true;
	}
	self.editor = new MediumEditor(editable, options);
	editable.on('input', function() {
		if (!self.changed.get()) {
			self.changed.set(true);
			self.data.beforeChange(function(text) {
				// we're notified that the field contents will soon change
				// as a simple solution, we just discard everything that is in the field. 
				// We could try merging the current contents with the updated version but that's for another day
				jQuery(self.findAll('.editable')).html('');
				if (self.changed.get()) {
					self.changed.set(false);
					addMessage(mf('editable.sorrychanged', "Sorry, somebody else just changed that. Your changes have been discarded."));
				}	
			})
		}
	});
}

Template.editable.helpers({
	changed: function() { return Template.instance().changed.get() }
});

Template.editable.events({
	'click .editable-store': function(event, instance) {
		instance.changed.set(false);
		var editable = instance.$('.editable')
		instance.data.store(editable.html());
	},
	'click .editable-cancel': function(event, instance) { 
		instance.$('.editable').html(instance.data.text);
		instance.changed.set(false);
	}
});

