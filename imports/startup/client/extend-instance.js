import { Blaze } from 'meteor/blaze';
import { ReactiveVar } from 'meteor/reactive-var';

/**
 * Get the parent template instance. Source: http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
 * @param {number} [levels=1] How many levels to go up. Default is 1
 * @returns {Blaze.TemplateInstance}
 */
/* eslint-disable-next-line consistent-return */
Blaze.TemplateInstance.prototype.parentInstance = function (levels = 1) {
	let { view } = this;
	while (view) {
		/* eslint-disable-next-line no-param-reassign, no-plusplus */
		if (view.name.substring(0, 9) === 'Template.' && !levels--) {
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
Blaze.TemplateInstance.prototype.findBusiness = function () {
	if (this.business) return this.business; // Short-circuit common case

	let businessInstance = this;
	while (businessInstance && !businessInstance.business) {
		businessInstance = businessInstance.parentInstance();
	}

	if (!businessInstance) {
		throw new Error('Unable to find parent instance with business set');
	}

	// Cache on the local instance
	this.business = businessInstance.business;

	return this.business;
};
