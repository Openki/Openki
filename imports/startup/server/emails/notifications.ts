import { Meteor } from "meteor/meteor";

import { Log } from "/imports/api/log/log";
import * as Notification from "../../both/emails/notification";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

// Watch the Log for event notifications
if (runBackgroundTasks)
  Meteor.startup(() => {
    // To avoid sending stale notifications, only consider records added in the
    // last hours. This way, if the server should have failed for a longer time,
    // no notifications will go out.
    const gracePeriod = new Date();
    gracePeriod.setHours(gracePeriod.getHours() - 72);

    // The Log is append-only so we only watch for additions
    Log.find({ tr: "Notification.Send", ts: { $gte: gracePeriod } }).observe({
      added: Notification.send,
    });
  });
