"use strict";

// The instance variables for editing are stored on the parent 'event'
// template instance because that's where the event handlers are attached too.
// The historical reason for this weird setup is that the event handlers
// needed access to the instance variables to change state, 'editing' and
// so forth. Improvements certainly possible but not a priority.
Template.event.onCreated(function() {
	var instance = this;
	this.locationState = new ReactiveVar('selecting');

	instance.whatLocation = function() {
		var location = this.data.location;
		if (location._id) return 'foreign';
		if (location.name) return 'own';
		return false;
	}

	// Tracked so that observe() will be stopped when the template is destroyed
	instance.autorun(function() {
		instance.markers.find({ proposed: true, selected: true }).observe({
			added: function(mark) {
				// When a propsed marker is selected, we clear the other location proposals and
				// store it as new location for the event
				var loc = $.extend(mark, { selected: false, proposed: false });
				instance.setLocation({ loc: loc });
				instance.markers.remove({ proposed: true });
			},
		});
	});
});


Template.eventEdit.onRendered(function() {
	updateTimes(this, false);
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
	},

	locationCandidates: function() {
		return Template.instance().parentInstance().markers.find({ proposed: true });
	},

	locationStateShow: function() {
		return Template.instance().parentInstance().locationState.get() == 'show';
	},

	locationStateSelect: function() {
		return Template.instance().parentInstance().locationState.get() == 'select';
	},

	locationStateAdd: function() {
		return Template.instance().parentInstance().locationState.get() == 'add';
	},

	locationIsSet: function() {
		return !!Template.instance().parentInstance().whatLocation();
	},

	allowPlacing: function() {
		var locationState = Template.instance().parentInstance().locationState;

		// We return a function so the reactive dependency on locationState is
		// established from within the map template which will call it. The
		// craziness is strong with this one.
		return function() {
			return locationState.get() == 'add';
		}
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

// As explained above the event handlers are attached to the parent 'event' instance
// so they have access to state variable 'editing'.
Template.event.events({
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
	
	'click button.cancelEditEvent': function () {
		if (this.new) history.back();
		Template.instance().editing.set(false);
	},

	'click .toggle_duration': function(event, template){
		template.$('.show_time_end').toggle(300);
		template.$('.show_duration').toggle(300);
	},

	'change #edit_event_duration, change #edit_event_startdate, change #edit_event_starttime': function(event, template) {
		updateTimes(template, true);
	},

	'change #edit_event_endtime': function(event, template) {
		updateTimes(template, false);
	},

	'click .-addressSearch': function(event, template) {
		var search = template.$('.-locationAddress').val();
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
	},

	'click .-locationChange': function(event, instance) {
		var newState = instance.whatLocation() == 'own' ? 'add' : 'select';
		instance.locationState.set(newState);
	},

	'click .-locationAdd': function(event, instance) {
		instance.locationState.set('add');
	}
});
