import { Events } from "/imports/api/events/events";
import { PublicSettings } from "/imports/utils/PublicSettings";

export function update() {
  let updated = 0;

  Events.find({ sendReminder: { $exists: false } })
    .fetch()
    .forEach((orginalEvent) => {
      const event = { ...orginalEvent };
      event.sendReminder = PublicSettings.sendReminderPreset;
      updated += Events.update(event._id, event);
    });

  return updated;
}
