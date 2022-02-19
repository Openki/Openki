import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ValidationError, ValidationErrorDetail } from 'meteor/mdg:validation-error';

import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import { Editable, State } from '/imports/ui/lib/editable';

import MediumEditor from 'medium-editor';

import '/imports/ui/components/buttons';

import './template.html';
import './styles.scss';

function EditableMixing<N extends string, D extends Editable, T extends Record<string, unknown>>(
	TemplateBase: TemplateStaticTyped<N, D, T>,
	templateName: N,
) {
	const Template = TemplateMixins.FormfieldErrors(
		TemplateBase as TemplateStaticTyped<
			N,
			D,
			T & {
				state: State;
				errorMapping: TemplateMixins.FormfieldErrorsMapping;
				editor: MediumEditor.MediumEditor;
				getEdited: () => string | undefined;
				getTotalFocusTimeInSeconds: () => number;
				store: () => Promise<void>;
				reset: () => void;
			}
		>,
		templateName,
	);

	const template = Template[templateName];
	template.onCreated(function () {
		const instance = this;
		// This reeks
		const { data } = instance;
		if (!data) {
			throw new Error('Editable got empty data');
		}
		instance.state = data.connect(instance);

		// Add error mapping for the FormfieldErrors
		const errorMapping: TemplateMixins.FormfieldErrorsMapping = {};
		const { clientValidations } = instance.state.store;
		if (clientValidations) {
			Object.keys(clientValidations).forEach((key) => {
				const validation = clientValidations[key];
				errorMapping[key] = {
					text: validation.errorMessage,
					field: 'input',
				};
			});
		}
		instance.state.store?.serverValidationErrors?.forEach((e) => {
			errorMapping[e.type] = {
				text: e.message,
				field: 'input',
			};
		});

		instance.errorMapping = errorMapping;
	});

	template.onRendered(function () {
		const instance = this;
		const editable = instance.$('.js-editable');
		let initialized = false;
		let changedByUser = false;
		let totalFocusTimeInSeconds = 0;
		let startGettingFocus: number | undefined;

		instance.getEdited = () => {
			if (!instance.state?.changed.get()) {
				return undefined;
			}
			return instance.state.simple ? editable.text().trim() : editable.html().trim();
		};

		instance.getTotalFocusTimeInSeconds = () => {
			return totalFocusTimeInSeconds;
		};

		instance.reset = () => {
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

		instance.store = async () => {
			const newText = instance.getEdited();
			try {
				await instance.state.store.onSave?.(newText);

				instance.state.changed.set(false);
				changedByUser = false;
				startGettingFocus = undefined;
				totalFocusTimeInSeconds = 0;

				instance.state.store.onSuccess?.(newText);
			} catch (err: unknown) {
				if (ValidationError.is(err)) {
					// Handle server validation errors
					(err.details as unknown as ValidationErrorDetail[]).forEach((fieldError) => {
						instance.errors.add(fieldError.type);
					});
				} else {
					// Handle global error
					instance.state.store.onError?.(err, newText);
				}
			}
		};

		const options: MediumEditor.CoreOptions = {
			placeholder: {
				hideOnClick: false,
				text: instance.state.placeholderText,
			},
			anchor: {
				linkValidation: true,
				placeholderText: i18n('editable.link.placeholder', 'Paste link here…'),
			},
			autoLink: true,
			buttonLabels: 'fontawesome',
		};
		if (instance.state.simple) {
			options.disableReturn = true;
			options.toolbar = false;
		}

		// Initialize the editor interface
		instance.editor = new MediumEditor(editable as any, options);

		// Register when the field is being edited
		editable.on('input', () => {
			changedByUser = true;
			instance.state.changed.set(true);
		});

		editable.on('focus', () => {
			startGettingFocus = Date.now();
		});
		editable.on('blur', () => {
			totalFocusTimeInSeconds += Math.round(
				(Date.now() - (startGettingFocus || Date.now())) / 1000,
			);
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
		'click .js-editable-save'(event, instance) {
			event.preventDefault();

			// Check if input is invalid
			instance.errors.reset();
			const { clientValidations } = instance.state.store;
			if (clientValidations) {
				Object.keys(clientValidations).forEach((key) => {
					const validation = clientValidations[key];
					if (!validation.check(instance.getEdited())) {
						instance.errors.add(key);
					}
				});
			}
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

		'click .js-editable-edit'(_event, instance) {
			instance.$('.js-editable').trigger('focus');

			// Moving the cursor to the end of the editable element?
			// http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
			const selectEnd = function (el: Node) {
				const range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				const selection = window.getSelection();
				selection?.removeAllRanges();
				selection?.addRange(range);
			};
			selectEnd(instance.$('.js-editable')[0]);
		},
	});
}

['editable', 'editableTextarea'].forEach((templateName) => {
	EditableMixing(TemplateAny as any, templateName);
});
