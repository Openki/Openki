import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import * as Alert from '/imports/api/alerts/alert';
import Categories from '/imports/api/categories/categories';
import { Course, CourseMemberEntity, CourseModel, Courses } from '/imports/api/courses/courses';
import * as CoursesMethods from '/imports/api/courses/methods';
import { GroupEntityAdditionalInfoForProposals, Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import { RoleEntity, Roles } from '/imports/api/roles/roles';

import { Editable } from '/imports/ui/lib/editable';
import { SaveAfterLogin } from '/imports/ui/lib/save-after-login';

import * as StringTools from '/imports/utils/string-tools';
import { hasRoleUser } from '/imports/utils/course-role-utils';
import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';

import './template.html';
import './styles.scss';

export type Data = {
	_id?: string;
	categories: string[];
	isFrame?: boolean;
	group: string;
	teamGroups: string[];
	hideRoleSelection: boolean;
	hidePricePolicy: boolean;
	roles: string[];
	creatorsRoles: string[];
} & Partial<CourseModel>;

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseEdit',
		Data,
		{
			editableDescription: Editable;
			state: ReactiveDict<{
				editingCategories: boolean;
				selectedCategories: string[];
				fullRoleSelection: boolean;
				simpleRoleSelection: boolean;
				simpleSelectedRole: string;
			}>;
			savedCourseId: ReactiveVar<string | undefined>;
			showSavedMessage: ReactiveVar<boolean>;
			showRegionSelection: () => boolean;
			showInternalCheckbox: () => boolean;
			getSavedCourse: () => CourseModel | undefined;
			getGroups: () => string[];
			additionalInfos: () => GroupEntityAdditionalInfoForProposals[];
			resetFields: () => void;
		}
	>;

	const template = Template.courseEdit;

	template.onCreated(function () {
		const instance = this;

		instance.busy(false);

		instance.editableDescription = new Editable(
			false,
			i18n(
				'course.description.placeholder',
				'Describe your idea, so that more people will find it and that they`ll know what to expect.',
			),
		);

		instance.state = new ReactiveDict();
		instance.state.setDefault({
			editingCategories: false,
			selectedCategories: [],
			fullRoleSelection: true,
			// For iframes: On true shows a simple role selection like: [I want to learn] [I can teach]
			simpleRoleSelection: false,
			// For iframes: Keep state of simple role selection
			simpleSelectedRole: 'participant',
		});

		instance.savedCourseId = new ReactiveVar(undefined);
		instance.showSavedMessage = new ReactiveVar(false);

		instance.autorun(() => {
			const data = Template.currentData();

			instance.editableDescription.setText(data.description || '');

			// Show category selection right away for new courses
			instance.state.set('editingCategories', !data._id);
			instance.state.set('selectedCategories', data.categories);

			if (!data.isFrame) {
				if (data.group) {
					instance.subscribe('group', data.group);
				}
			} else if (data.teamGroups) {
				data.teamGroups.forEach((g) => {
					instance.subscribe('group', g);
				});
			}

			if (data.isFrame) {
				// When we're in the propose frame, show a simplified role selection
				instance.state.set(
					'simpleRoleSelection',
					!this.data.hideRoleSelection && this.data.roles.includes('mentor'),
				);
				instance.state.set('fullRoleSelection', false);

				const courseId = this.savedCourseId.get();
				if (courseId) {
					this.subscribe('courseDetails', courseId);
				}
			}
		});

		instance.showRegionSelection = () => {
			const data = Template.currentData();
			return (
				// Region can be set for new courses only.
				!data._id &&
				// For the proposal frame we hide the region selection when a region
				// is set.
				!(data.region && data.isFrame) &&
				// If there is only one region on this instance or it is visible to this user, it
				// will be set automatically.
				!(Regions.findFilter({}, 2).count() === 1)
			);
		};

		instance.showInternalCheckbox = () => {
			const data = Template.currentData();

			let internalOption;

			const user = Meteor.user();
			if (!data.isFrame && data.group && user?.groups) {
				// Visible in group detail page (for creation) if user is in group
				internalOption = user.groups.includes(data.group);
			} else {
				// and visible on edit if course is in a group
				// For devs: This behaviour is not consistent. But we want the creation to be as simple
				// as possible.
				internalOption = (data.groups?.length || 0) > 0;
			}
			return internalOption;
		};

		instance.getSavedCourse = () => Courses.findOne(instance.savedCourseId.get());

		instance.getGroups = () => {
			const data = Template.currentData();
			const groups = [];
			if (!data.isFrame) {
				if (data.group) {
					groups.push(data.group);
				}
			} else if (data.teamGroups?.length > 0) {
				groups.push(...data.teamGroups);
			}
			return groups;
		};

		instance.additionalInfos = () => {
			const groups = instance.getGroups();

			return Groups.find({ _id: { $in: groups } })
				.fetch()
				.flatMap((g) => g.additionalInfosForProposals || []);
		};

		instance.resetFields = () => {
			instance.$('.js-title').val('');
			instance.$('.editable-textarea').html('');
			instance.state.set('selectedCategories', []);
			instance.state.set('simpleSelectedRole', 'participant');
		};
	});

	template.helpers({
		simpleRoleActiveClass(role: string) {
			// HACK using btn-add and btn-edit to show activation state
			// It would be better to introduce own classes for this task.
			if (Template.instance().state.equals('simpleSelectedRole', role)) {
				return 'btn-add active';
			}
			return 'btn-edit';
		},

		availableCategories() {
			return Object.keys(Categories);
		},

		hasSubcategories(category: string) {
			return Categories[category].length > 0;
		},

		availableSubcategories(category: string) {
			// Hide if parent categories not selected
			const selectedCategories = Template.instance().state.get('selectedCategories');
			if (!selectedCategories?.includes(category)) {
				return [];
			}

			return Categories[category];
		},

		availableRoles() {
			return Roles.filter((role) => {
				// Roles that are always on are not selectable here
				if (role.preset) {
					return false;
				}

				return true;
			});
		},

		isChecked() {
			const selectedCategories = Template.instance().state.get('selectedCategories');
			return selectedCategories?.includes(`${this}`) ? 'checkbox-checked' : '';
		},

		checkCategory() {
			const selectedCategories = Template.instance().state.get('selectedCategories');
			return selectedCategories?.includes(`${this}`) ? 'checked' : '';
		},

		showMoreInfo() {
			return (
				Template.instance().showRegionSelection() ||
				Template.instance().additionalInfos().length > 0
			);
		},

		getAdditionalInfoValue(name: string) {
			return Template.currentData().additionalInfos?.filter((a) => a.name === name)[0]?.value;
		},

		hideCategories() {
			return this.isFrame && this.hideCategories;
		},

		isInternal() {
			return this.internal ? 'checked' : null;
		},

		proposeFromQuery() {
			const parentInstance = Template.instance().parentInstance() as any;
			const { filter } = parentInstance;
			if (!filter) {
				return false;
			}

			const { search } = filter.toParams();
			if (!search) {
				return false;
			}

			const filterQuery = filter.toQuery();
			const results = Courses.findFilter(filterQuery, 1);

			return results.count() === 0 && search;
		},

		courseSearch() {
			const parentInstance = Template.instance().parentInstance() as any;
			const filterParams = parentInstance.filter.toParams();

			return filterParams.search;
		},

		newCourseGroupName() {
			if (this.group) {
				const groupId = this.group;
				const group = Groups.findOne(groupId);
				if (group) {
					return group.name;
				}
			}
			return false;
		},

		showSavedMessage() {
			if (Template.currentData().isFrame) {
				return Template.instance().showSavedMessage.get();
			}
			return false;
		},

		savedCourseLink() {
			if (Template.currentData().isFrame) {
				const course = Template.instance().getSavedCourse();
				if (course) {
					return Router.url('showCourse', course);
				}
			}
			return false;
		},

		savedCourseName() {
			if (Template.currentData().isFrame) {
				const course = Template.instance().getSavedCourse();
				if (course) {
					return course.name;
				}
			}
			return false;
		},

		editBodyClasses() {
			const classes = [];

			if (Template.currentData().isFrame) {
				classes.push('is-frame');
			}

			return classes.join(' ');
		},

		hasPricePolicy() {
			const { hidePricePolicy } = Template.currentData();
			const data = Template.currentData();

			if (hidePricePolicy) {
				return false;
			}

			if (data && data instanceof Course) {
				if (!(data as CourseModel).isNew()) {
					return !(data as CourseModel).isPrivate();
				}
			}

			if (data.isFrame && data.region) {
				// The region was preset for the frame
				const region = Regions.findOne(data.region);
				if (region) {
					return !region.isPrivate();
				}
			}

			return !Regions.currentRegion()?.isPrivate();
		},
	});

	template.events({
		'change input[name=role]'(_event, instance) {
			instance.state.set(
				'simpleSelectedRole',
				instance.$('input[name=role]:checked').val() as string,
			);
		},

		'click .js-close'(_event, instance) {
			instance.showSavedMessage.set(false);
		},

		'submit form, click .js-course-edit-save'(event, instance) {
			event.preventDefault();

			const data = Template.currentData();
			const hasTeamGroups = !!(data.teamGroups?.length > 0);

			let internal;
			if (instance.showInternalCheckbox()) {
				// Usually an "internal" checkbox is displayed so that the users of a group can choose
				// whether the course is internal or not.
				internal = instance.$('.js-check-internal').is(':checked');
			} else if (data.isFrame && hasTeamGroups) {
				// When in a frame for a group, the `internal` query-param can be set to control whether
				// the group wants the entered courses to be internal.
				internal = data.internal;
			}
			// Default is not internal
			internal = internal || false;

			const changes = {
				internal,
				name: StringTools.saneTitle(instance.$('.js-title').val() as string),
				categories: instance.state.get('selectedCategories') || [],
			} as Required<CoursesMethods.SaveFields>;

			if (changes.name.length === 0) {
				Alert.serverError(i18n('course.edit.error.title', 'Please provide a title'));
				return;
			}

			const newDescription = instance.editableDescription.getEdited();
			if (newDescription) {
				changes.description = newDescription;
			}

			let courseId = data._id || '';
			const isNew = courseId === '';
			if (isNew) {
				if (data.isFrame && data.region) {
					// The region was preset for the frame
					changes.region = data.region;
				} else if (Regions.findFilter({}, 2).count() === 1) {
					// There is only one region
					changes.region = Regions.findOne({})?._id as string;
				} else {
					changes.region = instance.$('.js-select-region').val() as string;
				}
				if (!changes.region) {
					Alert.serverError(i18n('course.edit.error.region', 'Please select a region'));
					return;
				}

				changes.groups = instance.getGroups();
			}

			changes.roles = {};
			changes.subs = [];
			changes.unsubs = [];

			if (data.isFrame) {
				data.roles.forEach((role) => {
					changes.roles[role] = true;
				});

				if (
					instance.state.equals('simpleRoleSelection', true) &&
					instance.state.equals('simpleSelectedRole', 'mentor')
				) {
					changes.subs.push('mentor');
				}

				// Create unique, merged array
				changes.subs = [...new Set([...changes.subs, ...data.creatorsRoles])];
			}

			if (instance.state.equals('fullRoleSelection', true)) {
				instance.$('.js-check-role').each(function () {
					const inputElement = this as HTMLInputElement;
					changes.roles[inputElement.name] = inputElement.checked;
				});
				instance.$('.js-check-enroll').each(function () {
					const inputElement = this as HTMLInputElement;
					const role = inputElement.name;
					const subscribe = !!inputElement.checked;
					if (subscribe) {
						changes.subs.push(role);
					} else {
						changes.unsubs.push(role);
					}
				});
			}

			changes.additionalInfos = instance.additionalInfos().map((i) => {
				return { name: i.name, value: instance.$(`.js-additional-info-${i.name}`).val() as string };
			});

			instance.busy('saving');
			SaveAfterLogin(
				instance,
				i18n('loginAction.saveCourse', 'Login and save course'),
				i18n('registerAction.saveCourse', 'Register and save course'),
				async () => {
					try {
						courseId = (await CoursesMethods.save(courseId, changes)) as string;

						if (instance.data.isFrame) {
							instance.savedCourseId.set(courseId);
							instance.showSavedMessage.set(true);
							instance.resetFields();

							Analytics.trackEvent(
								'Course creations',
								`Course creations as ${
									changes.subs.length > 0 ? changes.subs.sort().join(' and ') : 'participant'
								}`,
								Regions.findOne(changes.region)?.nameEn,
								instance.editableDescription.getTotalFocusTimeInSeconds(),
							);
						} else {
							if (isNew) {
								Alert.success(
									i18n('message.courseCreated', 'The course "{NAME}" has been created!', {
										NAME: changes.name,
									}),
								);
								Analytics.trackEvent(
									'Course creations',
									`Course creations as ${
										changes.subs.length > 0 ? changes.subs.sort().join(' and ') : 'participant'
									}`,
									Regions.findOne(changes.region)?.nameEn,
									instance.editableDescription.getTotalFocusTimeInSeconds(),
								);
							} else {
								Alert.success(
									i18n(
										'message.courseChangesSaved',
										'Your changes to the course "{NAME}" have been saved.',
										{ NAME: changes.name },
									),
								);
							}

							Router.go('showCourse', { _id: courseId });
						}
					} catch (err) {
						Alert.serverError(err, 'Saving the course went wrong');
					} finally {
						instance.busy(false);
					}
				},
			);
		},

		'click .js-course-edit-cancel'(_event, instance) {
			const course = instance.data;

			if (course._id) {
				Router.go('showCourse', course);
			} else {
				Router.go('/');
			}
		},

		'click .js-edit-categories'() {
			Template.instance().state.set('editingCategories', true);
		},

		'change .js-category-checkbox'(_event, instance) {
			const catKey = `${this}`;
			let selectedCategories = instance.state.get('selectedCategories') || [];
			const checked = instance.$(`input.cat_${catKey}`).prop('checked');
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

			instance.state.set('selectedCategories', selectedCategories);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseEditRole',
		{ selected: string[]; role: RoleEntity; members: CourseMemberEntity[] },
		{ checked: ReactiveVar<boolean> }
	>;

	const template = Template.courseEditRole;
	template.onCreated(function () {
		this.checked = new ReactiveVar(false);
	});

	template.onRendered(function () {
		const { data } = this;
		const selectedRoles = data.selected;

		if (selectedRoles) {
			this.checked.set(selectedRoles.includes(data.role.type));
		}
	});

	template.helpers({
		roleDescription() {
			return `roles.${Template.currentData().role.type}.description`;
		},

		roleSubscription() {
			return `roles.${Template.currentData().role.type}.subscribe`;
		},

		checkRole() {
			const instance = Template.instance();
			return instance.checked.get() ? 'checked' : null;
		},

		hasRole() {
			const data = Template.currentData();
			return data.members && hasRoleUser(data.members, data.role.type, Meteor.userId())
				? 'checked'
				: null;
		},
	});

	template.events({
		'change .js-check-role'(_event, instance) {
			instance.checked.set(instance.$('.js-check-role').prop('checked'));
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseTitle',
		Record<string, unknown>,
		{
			proposedSearch: ReactiveVar<string>;
			focused: ReactiveVar<boolean>;
			dropdownVisible: () => boolean;
		}
	>;

	const template = Template.courseTitle;
	template.onCreated(function () {
		this.proposedSearch = new ReactiveVar('');
		this.focused = new ReactiveVar(false);

		this.dropdownVisible = () => this.focused.get() && this.proposedSearch.get().length > 3;

		this.autorun(() => {
			if (this.dropdownVisible()) {
				this.subscribe('Courses.findFilter', {
					search: this.proposedSearch.get(),
					region: Session.get('region'),
				});
				if (!this.$('.dropdown').hasClass('open')) {
					this.$('.dropdown-toggle').dropdown('toggle');
				}
			}
		});
	});

	template.helpers({
		proposedCourses() {
			const instance = Template.instance();
			const search = instance.proposedSearch.get();
			const region = Session.get('region');
			if (instance.dropdownVisible()) {
				return Courses.findFilter({ search, region }, 20, undefined, [['name', 'asc']]);
			}
			return [];
		},
	});

	template.events({
		'keydown .js-title'(event, instance) {
			if ((event as any).keyCode === 9) {
				instance.$('.dropdown-toggle').dropdown('toggle');
				instance.focused.set(false);
			}
		},

		'keyup .js-title'(event, instance) {
			// arrow down does not work in bootstrap dropdown widget
			if ((event as any).keyCode === 40) {
				instance.$('.js-proposed-courses').find('a:first').trigger('focus');
			}
		},

		'input .js-title': _.debounce((event, instance) => {
			instance.proposedSearch.set((event.target as any).value);
		}, 220),

		'focus .js-title'(_event, instance) {
			instance.focused.set(true);
		},

		'focusout .js-proposed-search'(event, instance) {
			if (instance.$((event as any).relatedTarget).closest('.js-proposed-search').length === 0) {
				instance.focused.set(false);
			}
		},

		'keydown .js-dropdown-entry'(event, instance) {
			if ((event as any).keyCode === 9 && !(event as any).shiftKey) {
				instance.$('.dropdown-toggle').dropdown('toggle');
			}
		},
	});
}
