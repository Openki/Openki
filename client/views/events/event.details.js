"use strict";
// routing is in /routing.js

Template.event.onCreated(function() {
	var instance = this;
	this.editing = new ReactiveVar(false);
	var markers = new Meteor.Collection(null);
	this.markers = markers;

	this.setLocation = function(location) {
		markers.remove({ main: true });
		if (location && location.loc) {
			var loc = $.extend(location.loc, { main: true });
			delete loc._id;
			markers.insert(loc);
		}
	}

	this.setRegion = function(region) {
		markers.remove({ center: true });
		instance.region = region;
		if (region && region.loc) {
			var center = $.extend(region.loc, { center: true })
			markers.insert(center);
		}
	}

	// Tracked so that observe() will be stopped when the template is destroyed
	Tracker.autorun(function() {
		markers.find({ proposed: true, selected: true }).observe({
			added: function(mark) {
				// When a propsed marker is selected, we clear the other location proposals and
				// store it as new location for the event
				var loc = $.extend(mark, { selected: false, proposed: false });
				instance.setLocation({ loc: loc });
				markers.remove({ proposed: true });
			},
		});
	});
});


Template.event.onRendered(function() {
	var instance = this;

	this.setLocation(this.data);

	var region = Regions.findOne(instance.data.region);
	instance.setRegion(region);

	if (this.data.location) {
		Meteor.subscribe('locationDetails', instance.data.location);

		Tracker.autorun(function() {
			var location = Locations.findOne(instance.data.location);

			if (location) {
				instance.setLocation(location);
				var region = Regions.findOne(location.region);
				instance.setRegion(region);
			}
		});
	}
});


Template.eventDisplay.created = function() {
	this.replicaDates = new ReactiveVar([]);
}


Template.eventDisplay.onRendered(function() {
	updateReplicas(this);
});


Template.eventEdit.onRendered(function() {
	updateTimes(this, false);
});


Template.eventPage.helpers({
	course: function() {
		var courseId = this.course_id;
		if (courseId) {
			// Very bad?
			Template.instance().subscribe('courseDetails', courseId);
			
			return Courses.findOne({_id: courseId});
		}
	},
});


Template.event.helpers({
	editing: function() {
		return this.new || Template.instance().editing.get();
	},
});


Template.eventEdit.helpers({
	isoDateFormat: function(date) {
		return moment(date).format("YYYY-MM-DD");
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
					   if (this.course_id) return false;
					   return true;
	},
	
	currentRegion: function(region) {
		var currentRegion = Session.get('region')
		return currentRegion && region._id == currentRegion;
	},
	
	disableForPast: function() {
		return this.start > new Date ? '' : 'disabled';
	},

	eventMarkers: function() {
		return Template.instance().parentInstance().markers;
	}
});

Template.eventDisplay.helpers({
	isoDateFormat: function(date) {
		return moment(date).format("YYYY-MM-DD");
	},

	affectedReplicaCount: function() {
		Template.instance().subscribe('affectedReplica', this._id);
		return Events.find(affectedReplicaSelectors(this)).count();
	},
	
	replicaDateCount: function() {
		return Template.instance().replicaDates.get().length;
	},
	
	replicaDates: function() {
		return Template.instance().replicaDates.get();
	},
	
	mayEdit: function() {
		return mayEditEvent(Meteor.user(), this);
	},
	eventMarkers: function() {
		return Template.instance().parentInstance().markers;
	}
});

Template.eventDescritpionEdit.rendered = function() {
	new MediumEditor(this.firstNode);
}


var getEventStartMoment = function(template) {
	var startDateStr = template.$('#edit_event_startdate').val();
	var startMoment =  moment(startDateStr, 'YYYY-MM-DD');
	var startTime = template.$('#edit_event_starttime').val();
	var startTimeParts = startTime ? startTime.split(":") : [0,0];
	var minutes = startTimeParts[1];
	var hours = startTimeParts[0];
	startMoment.hours(hours);
	startMoment.minutes(minutes);
	return startMoment;
}

var getEventEndMoment = function(template) {
	var startMoment = getEventStartMoment(template);
	var endMoment = moment(startMoment);
	var endTime = template.$('#edit_event_endtime').val();
	var endTimeParts = endTime ? endTime.split(":") : [0,0];
	var minutes = endTimeParts[1];
	var hours = endTimeParts[0];
	endMoment.hours(hours);
	endMoment.minutes(minutes);
	if(endMoment.diff(startMoment) < 0) {
		endMoment.add(1,"day");
	}

	return endMoment;
}

var getEventDuration = function(template) {
	var duration = parseInt(template.$('#edit_event_duration').val(), 10);
	return Math.max(0,duration);
}


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
	template.$('#edit_event_startdate').val(start.format('YYYY-MM-DD'));
	template.$('#edit_event_starttime').val(start.format('HH:mm'));
	template.$('#edit_event_endtime').val(end.format('HH:mm'));
	template.$('#edit_event_duration').val(duration.toString());
}


var updateReplicas = function(template) {
	template.replicaDates.set(_.map(getEventFrequency(template), function(interval) { return interval[0]; } ));
}


var getEventFrequency = function(template) {
	var startDate = moment(template.$('.replicate_start').val(), 'YYYY-MM-DD');
	if (!startDate.isValid()) return [];
	var endDate   = moment(template.$('.replicate_end').val(), 'YYYY-MM-DD');
	if (!endDate.isValid()) return [];
	var frequency = template.$('.replicate_frequency').val();
	var diffDays = endDate.diff(startDate, "days");
	
	var unit = { once: 'days', daily: 'days', weekly: 'weeks' }[frequency];
	if (unit === undefined) return [];
	
	var eventStart = moment(template.data.start);
	var originDay = moment(eventStart).startOf('day');
	var eventEnd = moment(template.data.end);
	
	var now = moment();
	var repStart = moment(startDate).startOf('day');
	var dates = [];
	while(true) {
		var daysFromOriginal = repStart.diff(originDay, 'days');
		if (daysFromOriginal !=0 && repStart.isAfter(now)) {
			dates.push([
				moment(eventStart).add(daysFromOriginal, 'days'),
				moment(eventEnd).add(daysFromOriginal, 'days')
			]);
			if (frequency == 'once') break;
			if (dates.length >= 52) break;
		}

		repStart.add(1, unit);

		if (repStart.isAfter(endDate)) break;
	}

	return dates;
};


Template.event.events({
	'click button.eventDelete': function () {
		if (pleaseLogin()) return;
		if (confirm('Delete event "'+this.title+'"?')) {
			var title = this.title;
			var course = this.course_id;
			Meteor.call('removeEvent', this._id, function (error, eventRemoved){
				if (eventRemoved) {
					addMessage(mf('event.removed', { TITLE: title }, 'Successfully removed event "{TITLE}".'), 'success');
					if (course) Router.go('showCourse', { _id: course });
				} else {
					addMessage(mf('event.remove.error', { TITLE: title }, 'Error during removal of event "{TITLE}".'), 'danger');
				}
			});
			Template.instance().editing.set(false);
		}
	},
	
	'click button.eventEdit': function (event, template) {
		if (pleaseLogin()) return;
		Template.instance().editing.set(true);
	},
	
	'change .eventFileInput': function(event, template) {
		template.$('button.eventFileUpload').toggle(300);
	}, 
	'click button.eventFileUpload': function(event, template) {
		
		var fileEvent = $('.eventFileInput')[0].files;
		
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
					template.$('button.eventFileUpload').hide(50);
				
					var fileHtml = '<tr id="row-' + fileObj._id + '">';
					fileHtml += '<td style="padding-right:5px;">';
					fileHtml += '<a href="/cfs/files/files/' + fileObj._id + '" target="_blank">' + fileObj.original.name + '</a>';
					fileHtml += '</td><td><button role="button" class="fileDelete close" type="button">';
					fileHtml += '<span class="glyphicon glyphicon-remove"></span></button></td></tr>';
				
					$("table.file-list").append(fileHtml);
				
				}
			});
		});
	},
	
	'click button.fileDelete': function (event, template) {
		
		var fileid = this._id;
		var eventid = template.data._id;
		var filename = this.filename;
		//delete the actual file
		var fp = Files.remove(fileid);
		
		//hide file name
		var rowid = "tr#row-" + fileid;		
		$(rowid).hide();
		
		//remove file attribute from the event
		Meteor.call('removeFile', eventid, fileid, function (error, fileRemoved){
			if (fileRemoved) addMessage(mf('file.removed', { FILENAME:filename }, 'Successfully removed file {FILENAME}.'), 'success');
			else addMessage(mf('file.removed.fail', { FILENAME:filename }, "Couldn't remove file {FILENAME}."), 'danger');
		});		
	},
	
	
	'submit': function(event, template) {
		event.preventDefault();

		if (pleaseLogin()) return;

		var start = getEventStartMoment(template);
		if(!start.isValid()) {
			alert("Date format must be of the form 2015-11-30");
			return null;
		}
		var end = getEventEndMoment(template);

		var editevent = {
			title: template.$('#edit_event_title').val(),
			description: template.$('#edit_event_description').html(),
			location: template.$('#edit_event_location').val(),
			room: template.$('#edit_event_room').val(),
			start: start.toDate(),
			end:   end.toDate(),
			files: this.files || Array() ,
		};

		var fileList = template.files;
		template.files = null;

		//check if file object is stored in the template object
		if(fileList != null){
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

		var loc = template.markers.findOne({ main: true });
		if (loc) {
			delete loc._id;
			editevent.loc = loc;
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

			if (this.course_id) {
				var course = Courses.findOne(this.course_id);
				editevent.region = course.region;
				editevent.course_id = this.course_id;
			} else {
				editevent.region = template.$('.region_select').val();

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
		
		var updateReplicas = template.$("input[name='updateReplicas']").is(':checked');
		
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

				template.editing.set(false);
			}
		});
	},
	
	'click button.eventReplicate': function (event, template) {
		//get all startDates where the event should be created
		//this does not do anything yet other than generating the start-end times for a given period
		
		var dates = getEventFrequency(template);
		var success = true;	
		$.each( dates, function( i,eventTime ) {
			
			/*create a new event for each time interval */
			var replicaEvent = {

				title: template.data.title,
				description: template.data.description,
				location: template.data.location,
				room: template.data.room, //|| '',
				start: eventTime[0].toDate(),
				end: eventTime[1].toDate(),
				files: template.data.files  || new Array(),
				mentors: template.data.mentors  ||  new Array(),
				host: template.data.host ||  new Array(),
				region: template.data.region || Session.get('region'),
				replicaOf: template.data.replicaOf || template.data._id, // delegate the same replicaOf ID for this replica if the replicated event is also a replica
			};
		
			var course_id = template.data.course_id;
			if(course_id){
				replicaEvent.course_id  = course_id; 
			}

			var eventId = '';

			Meteor.call('saveEvent', eventId, replicaEvent, function(error, eventId) {
				if (error) {
					addMessage(mf('event.replicate.error', { ERROR: error }, 'Replicating the event went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
					success = false;
				} else {
					var fmtDate = moment(replicaEvent.start).format('LL');
					addMessage(mf('event.replicate.success', { TITLE: template.data.title, DATE: fmtDate }, 'Cloned event "{TITLE}" for {DATE}'), 'success');
				}
			});
		});

		template.$('div#eventReplicationMenu').slideUp(300);
		template.$('.eventReplicateMenu_close').hide(500);
		template.$('.eventReplicateMenu_open').show(500);
	},

	'click button.cancelEditEvent': function () {
		if (this.new) history.back();
		Template.instance().editing.set(false);
	},

	'click .toggle_duration': function(event, template){
		template.$('.show_time_end').toggle(300);
		template.$('.show_duration').toggle(300);
	},

	'click .eventReplicateMenu_open': function(event, template){
		template.$('div#eventReplicationMenu').slideDown(300);
		template.$('.eventReplicateMenu_open').hide(500);
		template.$('.eventReplicateMenu_close').show(500);
	},

	'click .eventReplicateMenu_close': function(event, template){
		template.$('div#eventReplicationMenu').slideUp(300);
		template.$('.eventReplicateMenu_close').hide(500);
		template.$('.eventReplicateMenu_open').show(500);
	},

	'change #edit_event_duration, change #edit_event_startdate, change #edit_event_starttime': function(event, template) {
		updateTimes(template, true);
	},

	'change #edit_event_endtime': function(event, template) {
		updateTimes(template, false);
	},

	'click .-addressSearch': function(event, template) {
		var search = template.$('.-address').val();
		var nominatimQuery = {
			format: 'json',
			q: search,
			limit: 10,
			polygon_geojson: 1
		};
		var region = template.region;
		if (region && region.loc) {
			nominatimQuery.viewbox = [
				region.loc.coordinates[0]-0.1,
				region.loc.coordinates[1]+0.1,
				region.loc.coordinates[0]+0.1,
				region.loc.coordinates[1]-0.1,
			].join(',');
			nominatimQuery.bounded = 1;
		}
		HTTP.get('https://nominatim.openstreetmap.org', {
			params:  nominatimQuery
		}, function(error, result) {
			if (error) {
				addMessage(error);
				return;
			}

			var found = JSON.parse(result.content);

			template.markers.remove({ proposed: true });
			if (found.length == 0) addMessage(mf('event.edit.noResultsforAddress', { ADDRESS: search }, 'Found no results for address "{ADDRESS}"'));
			_.each(found, function(foundLocation) {
				var marker = foundLocation.geojson;
				marker.proposed = true;
				template.markers.insert(marker);
			});
		});
	}
});

Template.eventDisplay.events({
	'change .updateReplicas, keyup .updateReplicas': function(event, template) {
		updateReplicas(template);
	}
});
