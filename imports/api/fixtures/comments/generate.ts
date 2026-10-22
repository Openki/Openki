import { Mongo } from "meteor/mongo";
import { sampleSize } from "lodash-es";
import { PRNG } from "seedrandom";

import { Groups } from "../../groups/groups";
import { GroupDiscussionEntity, GroupDiscussions } from "../../group-discussions/group-discussions";
import { Prng } from "/imports/api/fixtures/Prng";
import { Users } from "/imports/api/users/users";

import * as HtmlTools from "/imports/utils/html-tools";
import { Log } from "../../log/log";

/**
 * Select a date that is after the given date
 * For past dates a date between the original date and the present is chosen,
 * dates closer to the original date preferred.
 * For future dates, a date between the original date and double the time between now and then
 * is chosen.
 */
function sometimesAfter(prng: PRNG, date: Date) {
  // Seconds between then and now
  const spread = new Date(Math.abs(Date.now() - date.getTime())).getTime();

  // Quadratic dropoff: Place new date closer to the original date statistically
  const placement = prng();
  const squaredPlacement = placement * placement;

  return new Date(date.getTime() + spread * squaredPlacement);
}

export async function generate() {
  const prng = Prng("createComments");
  let count = 0;

  const userCount = await Users.countDocuments();
  for (const group of await Groups.find().fetchAsync()) {
    const createCount = Math.floor((prng() * 2) ** 4);
    const groupMembers = group.members.length;
    let { description } = group;
    if (!description) description = "No description"; // :-(
    const words = description.split(" ");

    for (let n = 0; n < createCount; n += 1) {
      const comment = {} as Mongo.OptionalId<GroupDiscussionEntity>;
      comment.groupId = group._id;
      comment.title = sampleSize(words, 1 + Math.floor(prng() * 3)).join(" ");
      comment.text = HtmlTools.sanitizeHtml(
        sampleSize(words, 5).join(" ") + sampleSize(words, Math.floor(prng() * 30)).join(" "),
      );

      comment.time_created = sometimesAfter(prng, group.time_created);
      comment.time_updated =
        prng() < 0.9 ? comment.time_created : sometimesAfter(prng, comment.time_created);

      if (!groupMembers || prng() < 0.2) {
        // Leave some anonymous comments
        if (prng() < 0.7) {
          const user = await Users.findOneAsync({}, { skip: Math.floor(prng() * userCount) });
          if (!user) {
            throw new Error("Unexpected undefined");
          }
          comment.userId = user._id;
        }
      } else {
        const commenter = group.members[Math.floor(prng() * groupMembers)];
        comment.userId = commenter.user;
      }

      await GroupDiscussions.insertAsync(comment);
    }

    count += createCount;
  }

  Log.record("testdata", ["GroupDiscussions"], { message: `Generated ${count} group comments.` });
}
