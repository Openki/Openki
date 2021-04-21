import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import TemplateMixins from '/imports/ui/lib/template-mixins';

import MediumEditor from 'medium-editor';

import '/imports/ui/components/buttons/buttons';

import './editable.html';

[Template.editable, Template.editableTextarea].forEach((template) => {
	template.onCreated(function () {
		// This reeks
		const data = Template.currentData();
		if (!data) {
			throw new Error('Editable got empty data');
		}
		this.state = data.connect(this);

		// Add error mapping for the FormfieldErrors
		const errorMapping = {};
		const { clientValidations } = this.state.store;
		Object.keys(clientValidations || {}).forEach((key) => {
			const validation = clientValidations[key];
			errorMapping[key] = {
				text: validation.errorMessage,
				field: 'input',
			};
		});
		this.state.store?.serverValidationErrors?.forEach((e) => {
			errorMapping[e.type] = {
				text: e.message,
				field: 'input',
			};
		});

		this.errorMapping = errorMapping;
	});

	TemplateMixins.FormfieldErrors(template);

	template.onRendered(function () {
		const instance = this;
		const editable = this.$('.js-editable');
		let initialized = false;
		let changedByUser = false;
		let totalFocusTimeInSeconds = 0;
		let startGettingFocus;

		instance.getEdited = function () {
			if (!instance.state?.changed.get()) {
				return undefined;
			}
			return instance.state.simple ? editable.text().trim() : editable.html().trim();
		};

		instance.getTotalFocusTimeInSeconds = function () {
			return totalFocusTimeInSeconds;
		};

		instance.reset = function () {
			const text = instance.state.text();

			if (instance.state.simple) {
				editable.text(text);
			} else {
				editable.html(text);
			}

			// HACK remove placeholder when there is content
			// We should be using setContent() anyway, but it's not defined?!
			if (text) {
				editable.removeClass('medium-editor-placeholder');
			}

			instance.errors.reset();
		};

		// Automatically replace contents when text changes
		// When the user has already made changes, we don't update the field. This
		// protects the user's changes but at the same time it allows overwriting
		// other people's changes.
		instance.autorun(() => {
			if (!changedByUser || !initialized) {
				instance.reset();
				initialized = true;
			}
		});

		instance.store = async function () {
			const newText = instance.getEdited();
			try {
				await instance.state.store.onSave(newText);

				instance.state.changed.set(false);
				changedByUser = false;
				startGettingFocus = undefined;
				totalFocusTimeInSeconds = 0;

				if (instance.state.store.onSuccess) {
					instance.state.store.onSuccess(newText);
				}
			} catch (err) {
				if (err.error === 'validation-error') {
					// Handle server validation errors
					err.details.forEach((fieldError) => {
						instance.errors.add(fieldError.type);
					});
				} else if (instance.state.store.onError) {
					// Handle global error
					instance.state.store.onError(err, newText);
				}
			}
		};

		const options = {
			placeholder: {
				hideOnClick: false,
				text: instance.state.placeholderText,
			},
			anchor: {
				linkValidation: true,
				placeholderText: mf('editable.link.placeholder', 'Paste link here...'),
			},
			autoLink: true,
			buttonLabels: 'fontawesome',
		};
		if (instance.state.simple) {
			options.disableReturn = true;
			options.toolbar = false;
		}

		// Initialize the editor interface
		instance.editor = new MediumEditor(editable, options);

		// Register when the field is being edited
		editable.on('input', () => {
			changedByUser = true;
			instance.state.changed.set(true);
		});

		editable.on('focus', () => {
			startGettingFocus = Date.now();
		});
		editable.on('blur', () => {
			totalFocusTimeInSeconds += Math.round((Date.now() - startGettingFocus) / 1000);
		});
	});

	template.helpers({
		showControls() {
			const instance = Template.instance();
			return instance.state.showControls && instance.state.changed.get();
		},

		wrapAttrs() {
			const instance = Template.instance();
			return instance.state.simple ? 'editable-wrap-simple' : 'editable-wrap-rich';
		},

		editableAttrs() {
			const instance = Template.instance();
			return instance.state.changed.get() ? 'editable-changed' : '';
		},
	});

	template.events({
		'blur .js-editable'(event, instance) {
			instance.$('.js-editable-edit').show();
		},

		'focus .js-editable'(event, instance) {
			instance.$('.js-editable-edit').hide();
		},

		'click .js-editable-save'(event, instance) {
			event.preventDefault();

			// Check if input is invalid
			instance.errors.reset();
			const { clientValidations } = instance.state.store;
			Object.keys(clientValidations || {}).forEach((key) => {
				const validation = clientValidations[key];
				if (!validation.check(instance.getEdited())) {
					instance.errors.add(key);
				}
			});
			if (instance.errors.present()) {
				return;
			}

			instance.store();
		},

		'click .js-editable-cancel'(event, instance) {
			event.preventDefault();
			instance.reset();
			instance.state.changed.set(false);
		},

		'click .js-editable-edit'(event, instance) {
			instance.$('.js-editable').focus();

			// Moving the cursor to the end of the editable element?
			// http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
			const selectEnd = function (el) {
				const range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			};
			selectEnd(instance.$('.js-editable')[0]);
		},
	});
});
