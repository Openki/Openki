import { Events } from "/imports/api/events/events";
import { PublicSettings } from "/imports/utils/PublicSettings";

export async function update() {
  let updated = 0;

  for (const orginalEvent of await Events.find({ sendReminder: { $exists: false } }).fetchAsync()) {
    const event = { ...orginalEvent };
    event.sendReminder = PublicSettings.sendReminderPreset;

    updated += await Events.updateAsync(event._id, event);
  }

  return updated;
}
