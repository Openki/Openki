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
