Template.editable.created = function() {
	this.changed = new ReactiveVar(false);
	this.editingVersion = false;
}

Template.editable.rendered = function() {
	var self = this;
	var editable = this.$('.editable');
	var options = {};
	if (this.data.simple) {
		options.disableReturn = true;
		options.disableToolbar = true;
	}
	
	// When the text changes while we are editing, the changes will be
	// inserted as new nodes instead of replacing the other nodes.
	// That's because Blaze doesn't know how to merge the current DOM
	// with the new text value it's given.
	// Merging the two versions is nontrivial and the current behaviour
	// is to just discard the local edits.
	self.autorun(function() {
		var currentText = Template.currentData().text;
		
		// Here we instill the version we got in the DB
		// Most of the time, it will be the same as what
		// is already displayed
		editable.html(currentText);
		
		if (self.editingVersion !== false && currentText !== self.editingVersion) {
			// Uh oh, not handling this well
			addMessage(mf('editable.sorrychanged', "Sorry, somebody else just changed that. Your changes have been discarded."));
			
			//:-( REALLY BAD
			self.changed.set(false);
			self.editingVersion = false;
		}
	});
	
	self.editor = new MediumEditor(editable, options);
	editable.on('input', function() {
		if (!self.changed.get()) {
			self.changed.set(true);
			self.editingVersion = self.data.text;
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
		instance.editingVersion = false;
	},
	'click .editable-cancel': function(event, instance) { 
		instance.$('.editable').html(instance.data.text);
		instance.changed.set(false);
		instance.editingVersion = false;
	}
});

