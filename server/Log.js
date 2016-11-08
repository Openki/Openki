Log = new Meteor.Collection('Log');
Log._ensureIndex({ track: 1});
Log._ensureIndex({ ts: 1});
Log._ensureIndex({ rel: 1});

Openki = {};
Openki.Log = function(track, rel, body) {
	check(track, String);
	check(rel, Match.Optional(String));
	check(body, Object);
	var entry =
		{ tr: track
		, ts: new Date()
		, body: body
		};

	if (rel) {
		entry.rel = rel;
	}

	Log.insert(entry);
};

Openki.Log.Notification = {};

// A notification event log entry records the intent to send notifications
// about an event to course members.
Openki.Log.Notification.Event = function(eventId, isNew) {
	var event = Events.findOne(eventId);
	check(event, Object);

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

	Openki.Log('notification.event', null, entry);
};

Openki.Log.Notification.Event.Result = function(rel, sent, recipient, message, reason) {
	check(rel, String);
	check(sent, Boolean);
	check(recipient, Match.Optional(String));
	check(message, Match.Optional(String));
	check(reason, String);
	var entry = {
		sent: sent,
		recipient: recipient,
		message: message,
		reason: reason
	};

	Openki.Log('notification.event.result', rel, entry);
};

Openki.Log.Notification.Event.handler = function() {
	var now = new Date();
	var gracePeriod = now.setHours(now.getHours() - 12);
	Log.find({ tr: 'notification.event', ts: { $geq: gracePeriod } }).observe({
		added: function(entry) {
			var concluded = {};

			Log.find(
				{ track: 'notification.event.result'
				, rel: entry._id
				}
			).each(function(result) {
				concluded[result.body.recipient] = true;
			});

			var event = Events.findOne(entry.body.eventId);
			var course = false;
			if (event && event.courseId) {
				course = Courses.findOne(event.courseId);
			}

			_.each(entry.body.recipients, function(recipient) {
				if (!concluded[recipient]) {
					try {
						if (!event) throw "Event does not exist (0.o)";
						if (!course) throw "Course does not exist (0.o)";

						var user = Meteor.users.findOne(recipient);
						if (!user) throw "User does not exist (0.o)";

						if (!user.emails || !user.emails[0] || !user.emails[0].address) {
							throw "Has no email address registered";
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

						var vars =
							{ event: event
							, course: course
							, eventDate: startMoment.format('LL')
							, eventStart: startMoment.format('LT')
							, eventEnd: startMoment.format('LT')
							, locale: userLocale
							, new: entry.new
							};

						var message = Blaze.toHTMLWithData(Template.notificationEventMail, vars);

						var subjectPrefix = '['+Accounts.emailTemplates.siteName+'] ';
						var subject;
						if (entry.new) {
							subject = mf('notification.event.mail.subject.new', subjectvars, "On {DATE}: {TITLE}");
						} else {
							subject = mf('notification.event.mail.subject.changed', subjectvars, "Fixed {DATE}: {TITLE}");
						}

						var mail =
							{ from: Accounts.emailTemplates.from
							, to: address
							, subject: subjectPrefix + subject
							, html: message
							};

						Email.send(email);
					}
					catch(reason) {
						Openki.Log.Notification.Event.Result(entry._id, false, recipient, false, reason);
					}

				}
			});
		}
	});
};