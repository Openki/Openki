import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';

import { Alert } from '/imports/api/alerts/alert';

const TemplateMixins = {
	/** Setup expand/collaps logic for a template
	*
	* @param {Object} template instance
	*
	* This mixin extends the given template with an `expanded` helper and
	* two click handlers `js-expand` and `js-close`. Only one expandible template
	* can be open at a time, so don't nest them.
	*
	* Example:
	* <template name="pushIt">
	*   <div>
	*     {{#if expanded}}
	*       All this content hiding here.
	*       Now close it again!
	*       <button type="button" class="js-collapse">CLOSE IT!</button>
	*     {{else}}
	*       Press the button!
	*       <button type="button" class="js-expand">OPEN IT!</button>
	*     {{/if}}
	*   </div>
	* </template>
	*/
	Expandible(template) {
		template.onCreated(function () {
			const expander = Random.id(); // Token to keep track of which Expandible is open
			this.expander = expander; // Read by event handlers
			this.collapse = function () {
				if (Session.equals('verify', expander)) {
					Session.set('verify', false);
				}
			};
		});
		template.helpers({
			expanded() {
				return Session.equals('verify', Template.instance().expander);
			},
		});
		template.events({
			'click .js-expand'(event, instance) {
				Session.set('verify', instance.expander);
				event.stopPropagation();
			},
			'click .js-collapse'() {
				Session.set('verify', false);
			},
		});
	},

	/** Like Expandible but multiple expandibles can be open at the same time. */
	MultiExpandible(template) {
		let dx = -1000;
		let dy = -1000;
		const nomove = function (e) {
			return Math.abs(dx - e.screenX) < 5 && Math.abs(dy - e.screenY) < 5;
		};

		template.onCreated(function () {
			this.expanded = new ReactiveVar(false);
		});
		template.helpers({
			expanded() {
				return Template.instance().expanded.get();
			},
		});
		template.events({
			mousedown(event) {
				dx = event.screenX;
				dy = event.screenY;
			},
			'mouseup .js-expand'(event, instance) {
				if (nomove(event)) {
					instance.expanded.set(true);
				}
			},
			'mouseup .js-collapse'(event, instance) {
				if (nomove(event)) {
					instance.expanded.set(false);
				}
			},
		});
	},

	/** Manage errors for a form template
	 *
	 * This mixin keeps a list of errors. It requires you to pass in
	 * a mapping of error-key to error message text and affected field. Example:
	 *
	 *   const mapping = {
	 *     'wrongPassword': {
	 *     text: () => "Your password is bad and you should feel bad.",
	 *     field: "password" },
	 *     'badUsername': {
	 *        text: () => "We don't like your username around here.",
	 *        field: "username" }
	 *   };
	 *   TemplateMixins.FormfieldErrors(Template.malcontentLogin, mapping);
	 *
	 * Note how `text` is a function so that you can pass in an mf() call
	 * that will only be evaluated once needed. (Not for performance but
	 * because the visitor could change language.)
	 *
	 * You can then add errors to be displayed with errors.add(key) and reset
	 * the list of errors with errors.reset(). For example:
	 *
	 *    instance.errors.reset();
	 *     if (password != "hunter2") {
	 *         instance.errors.add("wrongPassword")
	 *    }
	 *
	 * Use the template helpers {{errorClass}} and {{errorMessage}} to show the
	 * collected errors. You have to provide the helpers with the field name
	 * you-re interested in. Like so:
	 *
	 *    <label class="{{errorClass 'password'}}">
	 *       <input type='password'>
	 *       {{errorMessage 'password'}}
	 *    </label>
	 *
	 * {{errorClass}} just outputs the string "has-error" if that field has an
	 * error whereas {{errorMessage}} will output a <span> with the error message.
	 *
	 * @param {*} template The template to extend
	 * @param {*} [mapping] The mapping of error-keys to message objects
	 */
	FormfieldErrors(template, mapping = undefined) {
		template.helpers({
			errorClass(field) {
				if (Template.instance().errors.messages.findOne({ field })) {
					return 'has-error';
				}
				return false;
			},
			errorMessage(field) {
				const message = Template.instance().errors.messages.findOne({ field });
				if (!message) {
					return false;
				}

				const text = (Template.instance().errorMapping || mapping)[message.key].text();
				return Spacebars.SafeString(
					`<span class="help-block warning-block">${
						Blaze._escape(text)
					}</span>`,
				);
			},
		});

		template.onCreated(function () {
			const messages = new Mongo.Collection(null); // Local collection for in-memory storage
			this.errors = {
				messages,
				present() {
					return Boolean(messages.findOne({}));
				},
				add(key) {
					const message = (Template.instance().errorMapping || mapping)[key];
					if (!message) {
						Alert.error('Unmapped error');
						return;
					}

					this.messages.insert({ key, field: message.field });
				},
				reset() {
					this.messages.remove({});
				},
			};
		});
	},
};

export default TemplateMixins;
