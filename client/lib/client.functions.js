import '/imports/StringTools.js';

import { AddMessage } from '/imports/api/messages/methods.js';

getMember = function(members, user) {
	if (!members) return false;
	var member = false;
	members.forEach(function(member_candidate) {
		if (member_candidate.user == user) {
			member = member_candidate;
			return true; // break
		}
	});
	return member;
};

/* Go to the same page removing query parameters */
goBase = function() {
	Router.go(Router.current().route.name, Router.current().params); // Shirely, you know of a better way?
};

showServerError = function(message, err) {
	AddMessage(mf('_serverError', { ERROR: err, MESSAGE: message}, 'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.'), 'danger');
};

var subbedGroup = function(group) {
	var groupId = ''+group; // it's not a string?! LOL I DUNNO
	miniSubs.subscribe('group', groupId);
	return Groups.findOne(groupId);
};


groupNameHelpers = {
	short: function() {
		if (!this) return;
		var group = subbedGroup(this);
		if (!group) return "-";
		return group.short;
	},
	name: function() {
		if (!this) return;
		var group = subbedGroup(this);
		if (!group) return mf('group.missing', "Group does not exist");
		return group.name;
	},
};

/** Use null instead of 'all' to mean "All regions".
  * This is needed until all instances where we deal with regions are patched.
  */
cleanedRegion = function(region) {
	return region === 'all' ? null : region;
};

TemplateMixins = {
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




// http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
/** Get the parent template instance
  * @param {Number} [levels] How many levels to go up. Default is 1
  * @returns {Blaze.TemplateInstance}
  */
Blaze.TemplateInstance.prototype.parentInstance = function(levels) {
	var view = this.view;
	if (typeof levels === "undefined") {
		levels = 1;
	}
	while (view) {
		if (view.name.substring(0, 9) === "Template." && !(levels--)) {
			return view.templateInstance();
		}
		view = view.parentView;
	}
};


/** Set the business of the template instance
  *
  * This method will set up the 'business' variable on the template instance.
  * It needs to be called in onCreated() so the other methods will find the
  * var. Usually it will be this.busy(false) bout it could also be
  * this.busy('loading') for example.
  *
  * @param {String} [activity] The new business
  */
Blaze.TemplateInstance.prototype.busy = function (activity) {
	if (!this.business) {
		this.business = new ReactiveVar(activity);
	} else {
		this.business.set(activity);
	}
};


/** Find business state var in this or parent template instance
  */
Blaze.TemplateInstance.prototype.findBusiness = function() {
	if (this.business) return this.business; // Short-circuit common case

	var businessInstance = this;
	while (businessInstance && !businessInstance.business) {
		businessInstance = businessInstance.parentInstance();
	}

	if (!businessInstance) {
		throw "Unable to find parent instance with business set";
	}

	// Cache on the local instance
	this.business = businessInstance.business;

	return this.business;
};
