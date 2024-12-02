import { Meteor } from "meteor/meteor";
import schedule from "node-schedule";
import moment from "moment";

import { Events } from "/imports/api/events/events";
import { Log } from "/imports/api/log/log";
import { Notification } from "../both/emails/notification";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

async function sendReminder() {
  await Promise.all(
    await Events.find({
      // get all events in the next 24 h, do not send reminder if the event starts in 30 minutes (if an error case happened)
      start: { $gt: moment().add(30, "minutes").toDate(), $lt: moment().add(1, "days").toDate() },
      // ignore canceled events
      canceled: { $ne: true },
      sendReminder: { $eq: true },
    }).mapAsync(async (event) => {
      const alreadySent =
        (await Log.countDocuments({
          tr: "Notification.Send",
          rel: event._id,
          "body.model": "Event.Reminder",
        })) > 0;

      if (alreadySent) {
        return;
      }

      await Notification["Event.Reminder"].record(event._id);
    }),
  );
}

if (runBackgroundTasks)
  Meteor.startup(() => {
    // Run every 5 Minutes
    schedule.scheduleJob(
      "*/5 * * * *",
      Meteor.bindEnvironment(async () => {
        sendReminder();
      }),
    );
  });
