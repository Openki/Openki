"use strict";

_.each([Template.editable, Template.editableTextarea], function(template) {

template.onCreated(function() {
	// This reeks
	this.state = this.data.connect(this);
	this.editingVersion = false;
});

template.onRendered(function() {
	var instance = this;
	var editable = this.$('.js-editable');

	instance.getEdited = function() {
		if (!instance.state.changed.get()) return false;
		return instance.state.simple ? editable.text() : editable.html();
	};

	instance.reset = function() {
		var text = instance.state.text();

		if (instance.state.simple) {
			editable.text(text);
		} else {
			editable.html(text);
		}
	};

	// Automatically replace contents when text changes
	instance.autorun(function() {
		instance.reset();
	});

	// When the text changes while we are editing, we discard the changes made
	// by the user. Merging the changes is nontrivial.
	instance.autorun(function() {
		var changed = instance.state.changed.get();
		if (changed) {
			var upstreamText = instance.state.text();
			if (instance.editingVersion && upstreamText != instance.editingVersion) {
				// :'-(
				addMessage("Sorry, somebody else just changed that. Your changes have been discarded.", 'danger');
			}

			// keep for comparison
			instance.editingVersion = upstreamText;
		} else {
			instance.editingVersion = false;
		}
	});

	instance.store = function () {
		instance.state.store(instance.getEdited());
		instance.state.changed.set(false);
	};


	// Initialize the editor interface
	instance.editor = new MediumEditor(editable, options);

	var options = {
		placeholder: {
			hideOnClick: false,
			text: instance.state.placeholderText
		},
		anchor: {
			linkValidation: true,
			placeholderText: mf('editable.link.placeholder', "Paste link here...")
		},
		autoLink: true,
		buttonLabels: 'fontawesome'
	};
	if (instance.state.simple) {
		options.disableReturn = true;
		options.toolbar = false;
	}

	// Register when the field is being edited
	editable.on('input', function() {
		instance.state.changed.set(true);
	});
});

template.helpers({
	showControls: function() {
		var instance = Template.instance();
		return instance.state.showControls && instance.state.changed.get();
	},

	wrapAttrs: function() {
		var instance = Template.instance();
		return instance.state.simple ? 'editable-wrap-simple' : 'editable-wrap-rich';
	},

	editableAttrs: function() {
		var instance = Template.instance();
		return instance.state.changed.get() ? 'editable-changed' : '';
	}
});

template.events({
	'click .js-editable-save': function(event, instance) {
		event.preventDefault();
		instance.store();
	},

	'click .js-editable-cancel': function(event, instance) {
		event.preventDefault();
		instance.reset();
		instance.state.changed.set(false);
	},

	'click .js-editable-edit': function(event, instance) {
		// Moving the cursor to the end of the editable element?
		// http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
		var selectEnd = function(el) {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		};
		selectEnd(instance.$('.js-editable')[0]);
	}
});
});
