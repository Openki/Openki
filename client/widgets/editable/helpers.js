"use strict";

_.each([Template.editable, Template.editableTextarea], function(template) {

template.onCreated(function() {
	// This reeks
	this.state = this.data.connect(this);
});

template.onRendered(function() {
	var instance = this;
	var editable = this.$('.js-editable');
	var initialized = false;
	var changedByUser = false;

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

		// HACK remove placeholder when there is content
		// We should be using setContent() anyway, but it's not defined?!
		if (text && text.length > 0) editable.removeClass('medium-editor-placeholder');
	};

	// Automatically replace contents when text changes
	// When the user has already made changes, we don't update the field. This
	// protects the user's changes but at the same time it allows overwriting
	// other people's changes.
	instance.autorun(function() {
		if (!changedByUser || !initialized) {
			instance.reset();
			initialized = true;
		}
	});

	instance.store = function () {
		instance.state.store(instance.getEdited());
		instance.state.changed.set(false);
		changedByUser = false;
	};

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

	// Initialize the editor interface
	instance.editor = new MediumEditor(editable, options);

	// Register when the field is being edited
	editable.on('input', function() {
		changedByUser = true;
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
		instance.$('.js-editable').focus();

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
