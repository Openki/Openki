/* global Notification: true */
export default Notification = {};
import '/imports/collections/Log.js';

Notification.Event = {};

/** Record the intent to send event notifications
  *
  * @param      {ID} eventID   - event to announce
  * @param {Boolean} isNew     - whether the event is a new one
  */
Notification.Event.record = function(eventId, isNew, addNotificationMessage) {
	check(eventId, String);
	check(isNew, Boolean);
	var event = Events.findOne(eventId);
	if (!event) throw new Meteor.Error("No event for" + eventId);

	// What do we do when we receive an event which is not attached to a course?
	// For now when we don't have a course we just go through the motions but
	// the recipient list will be empty.
	var course = false;
	if (event.courseId) course = Courses.findOne(event.courseId);

	var entry = {};
	entry.new = isNew;
	entry.eventId = event._id;
	entry.additionalMessage = addNotificationMessage;

	// The list of recipients is built right away so that only course members
	// at the time of event creation will get the notice even if sending is
	// delayed.
	entry.recipients = [];
	if (course) {
		entry.recipients = _.pluck(course.members, 'user');
		entry.courseId = course._id;
	}

	Log.record('Notification.Event', [course._id], entry);
};


/** Handle event notification
  *
  * @param entry Notification.Event log entry to process
  */
Notification.Event.handler = function(entry) {
	// Find out for which recipients sending has already been attempted.
	var concluded = {};

	Log.find(
		{ tr: 'Notification.EventResult'
		, rel: entry._id
		}
	).forEach(function(result) {
		concluded[result.body.recipient] = true;
	});

	var event = Events.findOne(entry.body.eventId);
	var course = false;
	if (event && event.courseId) {
		course = Courses.findOne(event.courseId);
	}
	var region = false;
	if (event && event.region) {
	    region = Regions.findOne(event.region);
	}

	_.each(entry.body.recipients, function(recipient) {
		if (!concluded[recipient]) {
			var mail = null;
			var unsubToken = null;
			var userId = null;

			try {
				if (!event) throw "Event does not exist (0.o)";
				if (!course) throw "Course does not exist (0.o)";
				if (!region) throw "Region does not exist (0.o)";

				var user = Meteor.users.findOne(recipient);
				userId = user._id;

				if (user.profile.notifications === false) {
					throw "User wishes to not receive notifications";
				}

				if (!user.emails || !user.emails[0] || !user.emails[0].address) {
					throw "Recipient has no email address registered";
				}

				var	email = user.emails[0];
				var address = email.address;

				// Show dates in local time and in users locale
				var regionZone = LocalTime.zone(event.region);
				var userLocale = user.profile && user.profile.locale || 'en';

				var startMoment = regionZone.at(event.start);
				startMoment.locale(userLocale);

				var endMoment = regionZone.at(event.end);
				endMoment.locale(userLocale);


				var subjectvars =
					{ TITLE: event.title.substr(0,30)
					, DATE: startMoment.format('LL')
					};

				var subjectPrefix = '['+Accounts.emailTemplates.siteName+'] ';
				var subject;
				if (entry.new) {
					subject = mf('notification.event.mail.subject.new', subjectvars, "On {DATE}: {TITLE}");
				} else {
					subject = mf('notification.event.mail.subject.changed', subjectvars, "Fixed {DATE}: {TITLE}");
				}

				unsubToken = Random.secret();

				var vars =
					{ event: event
					, course: course
					, username: user.username
					, eventDate: startMoment.format('LL')
					, eventStart: startMoment.format('LT')
					, eventEnd: endMoment.format('LT')
					, regionName: region.name
					, timeZone: endMoment.format('z') // Ignoring the possibility that event start could have a different offset like when going from CET to CEST
					, locale: userLocale
					, eventLink: Router.url('showEvent', event)
					, calLink: Router.url('calEvent', event)
					, unsubLink: Router.url('profile.unsubscribe', { token: unsubToken })
					, new: entry.body.new
					, additionalMessage: entry.body.additionalMessage
					};

				var message = SSR.render("notificationEventMail", vars);


				mail =
					{ from: Accounts.emailTemplates.from
					, to: address
					, subject: subjectPrefix + subject
					, html: message
					};

				Email.send(mail);

				Notification.EventResult.record(entry, unsubToken, true, recipient, mail, "success");
			}
			catch(e) {
				var reason = e;
				if (typeof e == 'object' && 'toJSON' in e) reason = e.toJSON();
				Notification.EventResult.record(entry, unsubToken, false, recipient, mail, reason);
			}

		}
	});
};


Notification.EventResult = {};

/** Record the result of a notification delivery attempt
  * @param  {object} note      - notification log-entry
  * @param      {ID} unsubToken - token that can be used to unsubscribe from
  *                               further notices
  * @param {Boolean} sent      - whether the notification was sent
  * @param      {ID} recipient - recipient user ID
  * @param  {String} message   - generated message (or null if we didn't get
  *                              that far)
  * @param  {String} reason    - why this log entry was recorded
  */
Notification.EventResult.record = function(note, unsubToken, sent, recipient, message, reason) {
	check(sent, Boolean);
	check(unsubToken, Match.Maybe(String));
	check(recipient, String);
	check(message, Match.Maybe(Object));
	var entry = {
		sent: sent,
		recipient: recipient,
		message: message,
		reason: reason,
		unsubToken: unsubToken
	};

	var rel = [ note._id ];
	if (unsubToken) rel.push(unsubToken);

	Log.record('Notification.EventResult', rel, entry);
};
