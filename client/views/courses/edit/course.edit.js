
Template.courseEdit.created = function() {
	var instance = this;

	instance.busy(false);

	// Show category selection right away for new courses
	var editingCategories = !this.data || !this.data._id;
	this.editingCategories = new ReactiveVar(editingCategories);
	this.selectedCategories = new ReactiveVar(this.data && this.data.categories || []);

	instance.editableDescription = Editable(
		false,
		false,
		mf('course.description.placeholder', "Describe your idea, so that more people will find it and that they`ll know what to expect."),
		false
	);

	instance.autorun(function() {
		instance.editableDescription.setText(Template.currentData().description);
	});
};

Template.courseEdit.helpers({
	query: function() {
		return Session.get('search');
	},

	availableCategories: function() {
		return Object.keys(Categories);
	},

	availableSubcategories: function(category) {
		// Hide if parent categories not selected
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.indexOf(category) < 0) return [];

		return Categories[category];
	},

	editingCategories: function() {
		return Template.instance().editingCategories.get();
	},

	available_roles: function() {
		return _.filter(Roles, function(role) { return !role.preset; });
	},

	roleDescription: function() {
		return 'roles.'+this.type+'.description';
	},

	roleSubscription: function() {
		return 'roles.'+this.type+'.subscribe';
	},

	isChecked: function() {
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length && selectedCategories.indexOf(''+this) >= 0) {
			return 'checkbox-checked';
		}
		return '';
	},

	checkCategory: function() {
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length) {
			return selectedCategories.indexOf(''+this) >= 0 ? 'checked' : '';
		}
	},

	hasRole: function() {
		var instance = Template.instance();
		return instance.data && instance.data.members && hasRoleUser(instance.data.members, this.type, Meteor.userId()) ? 'checked' : null;
	},

	regions: function() {
		return Regions.find();
	},

	currentRegion: function(region) {
		var currentRegion = Session.get('region');
		return currentRegion && region._id == currentRegion;
	},

	isInternal: function() {
		return this.internal ? "checked" : null;
	},

	proposeFromQuery: function() {
		var parentInstance = Template.instance().parentInstance();
		var filter = parentInstance.filter;
		if (!filter) return false;

		var search = filter.toParams().search;
		if (!search) return false;

		var filterQuery = filter.toQuery();
		var results = coursesFind(filterQuery, 1);

		return (results.count() === 0) && search;
	},

	courseSearch: function() {
		var parentInstance = Template.instance().parentInstance();
		var filterParams = parentInstance.filter.toParams();

		return filterParams.search;
	},

	editableDescription: function() {
		return Template.instance().editableDescription;
	},

	newCourseGroupName: function () {
		if (this.groups && this.groups.length > 0) {
			var groupId = this.groups[0];
			var group = Groups.findOne(groupId);
			if (group) return group.name;
		}
	},

	userIsInGroup: function() {
		var user = Meteor.user();
		if (user && user.groups) {
			return user.groups.length > 0;
		} else {
			return false;
		}
	}
});


Template.courseEdit.events({
	'submit form, click .js-course-edit-save': function (ev, instance) {
		ev.preventDefault();


		if (pleaseLogin()) return;

		var course = instance.data;
		var courseId = course._id ? course._id : '';
		var isNew = courseId === '';

		var roles = {};
		instance.$('.js-check-role').each(function() {
			roles[this.name] = this.checked;
		});

		var changes = {
			categories: instance.selectedCategories.get(),
			name: instance.$('#editform_name').val(),
			roles: roles,
			internal: instance.$('.js-check-internal').is(':checked'),
		};

		var newDescription = instance.editableDescription.getEdited();
		if (newDescription) changes.description = newDescription;

		changes.name = saneText(changes.name);

		if (changes.name.length === 0) {
			alert("Please provide a title");
			return;
		}

		if (isNew) {
			changes.region = instance.$('.region_select').val();
			if (!changes.region) {
				alert("Please select a region");
				return;
			}

			var groups = [];
			if (Router.current().params.query.group) {
				groups.push(Router.current().params.query.group);
			}
			changes.groups = groups;
		}

		instance.busy('saving');
		Meteor.call("save_course", courseId, changes, function(err, courseId) {
			instance.busy(false);
			if (err) {
				showServerError('Saving the course went wrong', err);
			} else {
				Router.go('/course/'+courseId); // Router.go('showCourse', courseId) fails for an unknown reason
				addMessage("\u2713 " + mf('_message.saved'), 'success');

				instance.$('.js-check-enroll').each(function() {
					var method = this.checked ? 'add_role' : 'remove_role';

					Meteor.call(method, courseId, Meteor.userId(), this.name);
				});
			}
		});

		return false;
	},

	'click .js-course-edit-cancel': function(event, instance) {
		var course = instance.data;

		if (course._id) {
			Router.go('showCourse', course);
		} else {
			Router.go('/');
		}
	},

	'click .js-edit-categories': function (event, template) {
		Template.instance().editingCategories.set(true);
	},

	'change .js-category-checkbox': function(event, instance) {
		var catKey = ''+this;
		var selectedCategories = instance.selectedCategories.get();
		var checked = instance.$('input.cat_'+catKey).prop('checked');
		if (checked) {
			selectedCategories.push(catKey);
			selectedCategories = _.uniq(selectedCategories);
		} else {
			selectedCategories = _.without(selectedCategories, catKey);

			if (Categories[catKey]) {
				// Remove all the subcategories as well
				selectedCategories = _.difference(selectedCategories, Categories[catKey]);
			}
		}

		instance.selectedCategories.set(selectedCategories);
	}
});

Template.courseEditRole.onCreated(function() {
	this.checked = new ReactiveVar(false);
});

Template.courseEditRole.onRendered(function() {
	this.checked.set(this.data.selected.indexOf(this.data.role.type) >= 0);
});

Template.courseEditRole.helpers({
	roleDescription: function() {
		return 'roles.'+this.role.type+'.description';
	},

	roleSubscription: function() {
		return 'roles.'+this.role.type+'.subscribe';
	},

	checkRole: function() {
		var instance = Template.instance();
		return instance.checked.get() ? "checked" : null;
	},

	hasRole: function() {
		return this.members && hasRoleUser(this.members, this.role.type, Meteor.userId()) ? 'checked' : null;
	},
});

Template.courseEditRole.events({
	"change .js-check-role": function(event, instance) {
		instance.checked.set(instance.$(".js-check-role").prop("checked"));
	}
});
