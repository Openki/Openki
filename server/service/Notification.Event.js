Openki.Log.Notification = {};

/** Record the intent to send event notifications
  *
  * @param      {ID} eventID   - event to announce
  * @param {Boolean} isNew     - whether the event is a new one
  */
Openki.Log.Notification.Event = function(eventId, isNew) {
	check(eventId, String);
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

	// The list of recipients is built right away so that only course members
	// at the time of event creation will get the notice even if sending is
	// delayed.
	entry.recipients = [];
	if (course) {
		entry.recipients = _.pluck(course.members, 'user');
		entry.courseId = course._id;
	}

	Openki.Log('notification.event', [], entry);
};


/** Record the result of a notification delivery attempt
  * @param  {object} note      - notification log-entry
  * @param      {ID} unsubToken - token that can be used to unsubscribe from
  *                               further notices
  * @param {Boolean} sent      - whether the notification was sent
  * @param      {ID} recipient - recipient user ID
  * @param      {ID} userId    - target user ID (different for anon recipients)
  * @param  {String} message   - generated message (or null if we didn't get
  *                              that far)
  * @param  {String} reason    - why this log entry was recorded
  */
Openki.Log.Notification.Event.Result = function(note, unsubToken, sent, recipient, userId, message, reason) {
	check(sent, Boolean);
	check(unsubToken, Match.Maybe(String));
	check(recipient, String);
	check(message, Match.Maybe(Object));
	var entry = {
		sent: sent,
		recipient: recipient,
		userId: userId,
		message: message,
		reason: reason,
		unsubToken: unsubToken
	};

	var rel = [ note._id ];
	if (unsubToken) rel.push(unsubToken);

	Openki.Log('notification.event.result', rel, entry);
};


/** Handle event notification
  *
  * @param entry Notification.Event log entry to process
  */
Openki.Log.Notification.Event.handler = function(entry) {
	// Find out for which recipients sending has already been attempted.
	var concluded = {};

	Log.find(
		{ tr: 'notification.event.result'
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

	_.each(entry.body.recipients, function(recipient) {
		if (!concluded[recipient]) {
			var mail = null;
			var unsubToken = null;
			var userId = null;

			try {
				if (!event) throw "Event does not exist (0.o)";
				if (!course) throw "Course does not exist (0.o)";

				var user = Meteor.users.findOne(recipient);
				if (!user) {
					// Retry as anonId
					user = Meteor.users.findOne({anonId: recipient});
					if (!user) throw "Recipient does not exist (0.o)";
				}
				userId = user._id;

				if (user.profile.receiveNotifications === false) {
					throw "User wishes to not receive notifications";
				}

				if (!user.emails || !user.emails[0] || !user.emails[0].address) {
					throw "Recipient has no email address registered";
				}

				var	email = user.emails[0];
				var address = email.address;

				var userLocale = user.profile && user.profile.locale || 'en';
				var startMoment = moment(event.start);
				startMoment.locale(userLocale);
				var endMoment = moment(event.end);
				endMoment.locale(userLocale);

				var subjectvars =
					{ TITLE: event.title.substr(0,30)
					, DATE: startMoment.format('LL')
					};

				unsubToken = Random.secret();

				var vars =
					{ event: event
					, course: course
					, eventDate: startMoment.format('LL')
					, eventStart: startMoment.format('LT')
					, eventEnd: startMoment.format('LT')
					, locale: userLocale
					, unsubLink: Router.url('profile.unsubscribe', { token: unsubToken })
					, new: entry.new
					};

				var message = SSR.render("notificationEventMail", vars);

				var subjectPrefix = '['+Accounts.emailTemplates.siteName+'] ';
				var subject;
				if (entry.new) {
					subject = mf('notification.event.mail.subject.new', subjectvars, "On {DATE}: {TITLE}");
				} else {
					subject = mf('notification.event.mail.subject.changed', subjectvars, "Fixed {DATE}: {TITLE}");
				}

				mail =
					{ from: Accounts.emailTemplates.from
					, to: address
					, subject: subjectPrefix + subject
					, html: message
					};

				Email.send(mail);

				Openki.Log.Notification.Event.Result(entry, unsubToken, true, recipient, userId, mail, "success");
			}
			catch(e) {
				var reason = e;
				if (typeof e == 'object' && 'toJSON' in e) reason = e.toJSON();
				Openki.Log.Notification.Event.Result(entry, unsubToken, false, recipient, userId, mail, reason);
			}

		}
	});
};


// Watch the Log for event notifications
Meteor.startup(function() {
	SSR.compileTemplate('notificationEventMail', Assets.getText('mails/notificationEventMail.html'));

	// To avoid sending stale notifications, only consider records added in the
	// last hours. This way, if the server should have failed for a longer time,
	// no notifications will go out.
	var gracePeriod = new Date();
	gracePeriod.setHours(gracePeriod.getHours() - 12);

	// The Log is append-only so we only watch for additions
	Log.find({ tr: 'notification.event', ts: { $gte: gracePeriod } }).observe({
		added: Openki.Log.Notification.Event.handler
	});
});