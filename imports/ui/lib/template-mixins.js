export default TemplateMixins = {
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
	Expandible: function(template) {
		template.onCreated(function() {
			var expander = Random.id(); // Token to keep track of which Expandible is open
			this.expander = expander; // Read by event handlers
			this.collapse = function() {
				if (Session.equals('verify', expander)) {
					Session.set('verify', false);
				}
			};
		});
		template.helpers({
			'expanded': function() {
				return Session.equals('verify', Template.instance().expander);
			}
		});
		template.events({
			'click .js-expand': function(event, instance) {
				Session.set('verify', instance.expander);
				event.stopPropagation();
			},
			'click .js-collapse': function(event, instance) {
				Session.set('verify', false);
			},
		});
	},

	/** Like Expandible but multiple expandibles can be open at the same time. */
	MultiExpandible: function(template) {
		var dx = -1000;
		var dy = -1000;
		var nomove = function(e) {
			return Math.abs(dx - e.screenX) < 5 && Math.abs(dy - e.screenY) < 5;
		};

		template.onCreated(function() {
			this.expanded = new ReactiveVar(false);
		});
		template.helpers({
			'expanded': function() {
				return Template.instance().expanded.get();
			}
		});
		template.events({
			'mousedown': function(event) {
				dx = event.screenX;
				dy = event.screenY;
			},
			'mouseup .js-expand': function(event, instance) {
				if (nomove(event)) {
					instance.expanded.set(true);
				}
			},
			'mouseup .js-collapse': function(event, instance) {
				if (nomove(event)) {
					instance.expanded.set(false);
				}
			},
		});
	},
};
