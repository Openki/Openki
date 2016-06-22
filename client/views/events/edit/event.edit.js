Template.eventEdit.onCreated(function() {
	var instance = this;
	instance.parent = instance.parentInstance();
	instance.selectedRegion = new ReactiveVar(this.data.region || Session.get('region'));
	instance.selectedLocation = new ReactiveVar(this.data.location || {});
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
	'change .js-event-add-file': function(event, template) {
		template.$('.js-event-upload-file').toggle(300);
	},

	'click .js-event-upload-file': function(event, template) {

		var fileEvent = $('.js-event-add-file')[0].files;

		//FS.Utility.eachFile(fileEvent, function(file) {
		$.each( fileEvent, function(i,file){

			Files.insert(file, function (err, fileObj) {

				if (err){
					// add err handling
				} else {
					//adds a single file at a time at the moment
					var fileList = [
						{
							_id: fileObj._id,
							file : "/cfs/files/files/" + fileObj._id,
							filename : fileObj.original.name,
							filesize : fileObj.original.size,
						}
					];
					template.files = fileList;
					template.$('button.js-event-upload-file').hide(50);

					var fileHtml = '<tr id="row-' + fileObj._id + '">';
					fileHtml += '<td><i class="fa fa-file fa-fw" aria-hidden="true"></i>';
					fileHtml += '<a href="/cfs/files/files/' + fileObj._id + '" target="_blank">';
					fileHtml += fileObj.original.name + '</a>';
					fileHtml += '</td><td><button type="button" class="js-delete-file close"';
					fileHtml += 'data-tooltip="' + mf('event.edit.removeFile') + '">';
					fileHtml += '&times;</button></td></tr>';

					$("table.file-list").append(fileHtml);

				}
			});
		});
	},

	'click .js-delete-file': function (event, template) {
		var fileid = this._id;
		var eventid = template.data._id;
		var filename = this.filename;
		//delete the actual file
		Files.remove(fileid);

		//hide file name
		var rowid = "tr#row-" + fileid;
		$(rowid).hide();

		//remove file attribute from the event
		Meteor.call('removeFile', eventid, fileid, function (error, fileRemoved){
			if (fileRemoved) addMessage(mf('file.removed', { FILENAME:filename }, 'Successfully removed file {FILENAME}.'), 'success');
			else addMessage(mf('file.removed.fail', { FILENAME:filename }, "Couldn't remove file {FILENAME}."), 'danger');
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
			location: instance.selectedLocation.get(),
			room: instance.$('#eventEditRoom').val(),
			start: start.toDate(),
			end:   end.toDate(),
			files: this.files || Array(),
			internal: instance.$('.-eventInternal').is(':checked'),
		};

		var fileList = instance.files;
		instance.files = null;

		//check if file object is stored in the template object
		if (!!fileList) {
			var tmp = [];
			if(this.files){
				$.each( this.files, function( i,fileObj ){
					tmp.push( fileObj );
				});
			}

			$.each( fileList, function( i, fileObj ){
				tmp.push( fileObj );
			});

			editevent.files = tmp;
		}

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
				addMessage(mf('event.saving.error', { ERROR: error }, 'Saving the event went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
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

	'click .js-event-edit-cancel-btn': function (event, instance) {
		if (this.new) history.back();
		instance.parent.editing.set(false);
	},

	'click .js-toggle-duration': function(event, instance){
		Tooltips.hide();
		$('.label-duration').toggle();
		$('.input-group-duration').toggle();
		$('.label-time-end').toggle();
		$('.input-group-time-end').toggle();
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
