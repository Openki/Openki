Template.eventEdit.onCreated(function() {
	var instance = this;
	instance.parent = instance.parentInstance();
	instance.selectedRegion = new ReactiveVar(this.data.region || Session.get('region'));
	instance.selectedLocation = new ReactiveVar(this.data.venue || {});

	instance.uploaded = new ReactiveVar([]);
});

Template.eventEdit.onRendered(function() {
	updateTimes(this, false);

	this.$('.js-event-start-date').datepicker({
		weekStart: moment.localeData().firstDayOfWeek(),
		language: moment.locale(),
		autoclose: true,
		startDate: new Date(),
		format: {
			toDisplay: function(date) {
				return moment(date).format('L');
			},
			toValue: function(date) {
				return moment(date, 'L').toDate();
			}
		}
	});
});


Template.eventEdit.helpers({

	hasParentCourse: function() {
		return !! this.courseId;
	},

	localDate: function(date) {
		return moment(date).format("L");
	},

	affectedReplicaCount: function() {
		Template.instance().subscribe('affectedReplica', this._id);
		return Events.find(affectedReplicaSelectors(this)).count();
	},

	regions: function(){
		return Regions.find();
	},

	showRegionSelection: function() {
		// You can select the region for events that are new and not associated
		// with a course
		if (this._id) return false;
		if (this.courseId) return false;
		return true;
	},

	currentRegion: function(region) {
		var currentRegion = Session.get('region');
		return currentRegion && region._id == currentRegion;
	},

	showLocationSelection: function(region) {
		var selectedRegion = Template.instance().selectedRegion.get();
		return selectedRegion && selectedRegion !== 'all';
	},

	disableForPast: function() {
		return this.start > new Date() ? '' : 'disabled';
	},

	isInternal: function() {
		return this.internal ? "checked" : null;
	},

	uploaded: function() {
		return Template.instance().uploaded.get();
	}
});

Template.eventDescriptionEdit.rendered = function() {
	new MediumEditor(this.firstNode);
};


var readDateTime = function(dateStr, timeStr) {
	return moment(dateStr+' '+timeStr, 'L LT');
};


var getEventStartMoment = function(template) {
	return readDateTime(
		template.$('.js-event-start-date').val(),
		template.$('#editEventStartTime').val()
	);
};


var getEventEndMoment = function(template) {
	var startMoment = getEventStartMoment(template);
	var endMoment = readDateTime(
		startMoment.format('L'),
		template.$('#editEventEndTime').val()
	);

	// If the end time is earlier than the start time, assume the event
	// spans into the next day. This might result in some weird behavior
	// around hour-lapses due to DST (where 1:30 may be 'later'	than 2:00).
	// Well maybe you shouldn't schedule your events to start or end
	// in these politically fucked hours.
	if (endMoment.diff(startMoment) < 0) {
		endMoment = readDateTime(
			startMoment.add(1, 'day').format('L'),
			template.$('#editEventEndTime').val()
		);
	}

	return endMoment;
};


var getEventDuration = function(template) {
	var duration = parseInt(template.$('#editEventDuration').val(), 10);
	return Math.max(0,duration);
};


/* Patch the end time and the duration when start, end or duration changes */
var updateTimes = function(template, updateEnd) {
	var start = getEventStartMoment(template);
	var end = getEventEndMoment(template);
	var duration = getEventDuration(template);
	if (!start.isValid() || !end.isValid()) {
		// If you put into the machine wrong figures, will the right answers come out?
		return;
	}

	if (updateEnd) {
		end = moment(start).add(duration, 'minutes');
	}

	if (end.isBefore(start)) {
		// Let sanity prevail
		end = start;
		duration = 0;
	}

	duration = end.diff(start, 'minutes');
	template.$('#edit_event_startdate').val(start.format('L'));
	template.$('#editEventStartTime').val(start.format('LT'));
	template.$('#editEventEndTime').val(end.format('LT'));
	template.$('#editEventDuration').val(duration.toString());
};

Template.eventEdit.events({
	'change .js-event-add-file': function(event, instance) {
		FS.Utility.eachFile(event, function(file) {
			Files.insert(file, function (err, fileObj) {
				if (err) {
					addMessage(mf('file.upload.error', "Uploading file '" + fileObj.original.name + "; failed"));
				} else {
					var uploaded = instance.uploaded.get();

					uploaded.push({
						_id: fileObj._id,
						file : "/cfs/files/files/" + fileObj._id,
						filename : fileObj.original.name,
						filesize : fileObj.original.size,
					});

					instance.uploaded.set(uploaded);
				}
			});
		});
	},


	'click .js-delete-file': function (event, instance) {
		var fileId = this._id;
		var eventId = instance.data._id;
		var filename = this.filename;

		// check whether the file hasn't been associated with the event yet
		var uploaded = instance.uploaded.get();
		var uploadedClean = _.reject(uploaded, function(file) { return file._id === fileId; });
		if (uploadedClean.length < uploaded.length) {
			// The server does not allow to delete files that are not associated
			// to an event. So we just remove the local reference and hope
			// somebody will clean up stray files on the server
			instance.uploaded.set(uploadedClean);
			return;
		}

		Meteor.call('removeFile', eventId, fileId, function(error) {
			if (error) {
				showServerError("Couldn't remove file '" + filename + "'", error);
			} else {
				addMessage(mf('file.removed', { FILENAME:filename }, 'Removed file {FILENAME}.'), 'success');
			}
		});
	},

	'submit': function(event, instance) {
		event.preventDefault();

		if (pleaseLogin()) return;

		var start = getEventStartMoment(instance);
		if(!start.isValid()) {
			var exampleDate = moment().format('L');
			alert(mf('event.edit.dateFormatWarning', { EXAMPLEDATE: exampleDate }, "Date format must be of the form {EXAMPLEDATE}"));
			return null;
		}
		var end = getEventEndMoment(instance);

		var editevent = {
			title: instance.$('#eventEditTitle').val(),
			description: instance.$('#eventEditDescription').html(),
			venue: instance.selectedLocation.get(),
			room: instance.$('#eventEditRoom').val(),
			start: start.toDate(),
			end:   end.toDate(),
			internal: instance.$('.-eventInternal').is(':checked'),
		};

		editevent.files = (this.files || []).concat(instance.uploaded.get());

		var eventId = this._id;
		var isNew = !this._id;
		var now = moment();
		if (isNew) {
			eventId = '';

			if (start.isBefore(now)) {
				alert("Date must be in future");
				return;
			}

			if (this.courseId) {
				var course = Courses.findOne(this.courseId);
				editevent.region = course.region;
				editevent.courseId = this.courseId;
			} else {
				editevent.region = instance.selectedRegion.get();
				if (!editevent.region || editevent.region === 'all') {
					alert(mf('event.edit.plzSelectRegion', "Please select the region for this event"));
					return null;
				}

				// We have this 'secret' feature where you can set a group ID
				// in the URL to assign a group to the event on creation
				var groups = [];
				if (Router.current().params.query.group) {
					groups.push(Router.current().params.query.group);
				}
				editevent.groups = groups;
			}
		} else {
			// Don't allow setting dates in the past
			if (start.isBefore(now)) {
				delete editevent.start;
			}
			if (end.isBefore(now)) {
				delete editevent.end;
			}
		}

		var updateReplicas = instance.$("input[name='updateReplicas']").is(':checked');

		Meteor.call('saveEvent', eventId, editevent, updateReplicas, function(error, eventId) {
			if (error) {
				showServerError('Saving the event went wrong', error);
			} else {
				if (isNew) {
					Router.go('showEvent', { _id: eventId });
					addMessage(mf('event.creating.success', { TITLE: editevent.title }, 'Created event "{TITLE}".'), 'success');
				} else {
					addMessage(mf('event.saving.success', { TITLE: editevent.title }, 'Saved changes to event "{TITLE}".'), 'success');
				}

				if (updateReplicas) {
					addMessage(mf('event.edit.replicates.success', { TITLE: editevent.title }, 'Replicas of "{TITLE}" also updated.'), 'success');
				}
				instance.parent.editing.set(false);
			}
		});
	},

	'click .js-event-edit-cancel': function (event, instance) {
		if (instance.data.new) history.back();
		instance.parent.editing.set(false);
	},

	'click .js-toggle-duration': function(event, instance){
		Tooltips.hide();
		$('.time-end > *').toggle();
	},

	'change #editEventDuration, change #edit_event_startdate, change #editEventStartTime': function(event, template) {
		updateTimes(template, true);
	},

	'change #editEventEndTime': function(event, template) {
		updateTimes(template, false);
	},

	'change .js-select-region': function(event, instance) {
		instance.selectedRegion.set(instance.$('.js-select-region').val());
	},
});
