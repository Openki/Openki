/* oxlint-disable no-namespace */

import { Match, check } from "meteor/check";

import { Log } from "/imports/api/log/log";
import { Regions } from "/imports/api/regions/regions";
import { Users } from "/imports/api/users/users";

export namespace Username {
  export async function change(userId: string, newName: string) {
    check(userId, String);
    check(newName, String);

    let result;
    let success;
    try {
      result = await Users.updateAsync(userId, {
        $set: { username: newName },
      });
      success = result > 0;
    } catch (e) {
      result = e;
      success = false;
    }
    await Log.record("Profile.Username", [userId], {
      userId,
      name: newName,
      success,
      result,
      cause: "profile change",
    });

    return success;
  }
}

export namespace Email {
  export async function change(userId: string, email: string | undefined, reason: string) {
    check(userId, String);
    check(email, Match.Optional(String));
    check(reason, String);

    await Log.record("Profile.Email", [userId], {
      userId,
      email,
      reason,
    });

    let newValue = [] as { address: string; verified: boolean }[];
    if (email) {
      newValue = [{ address: email, verified: false }];
    }

    await Users.updateAsync(userId, {
      $set: { emails: newValue },
    });
  }
}

export namespace Notifications {
  /**
   * Update the receive automated notifications setting for a user
   * @param userId update the setting for this user
   * @param enable new state of the flag
   * @param relatedId related ID for the Log (optional)
   *
   */
  export async function change(
    userId: string,
    enable: boolean,
    relatedId: string | undefined,
    reason: string,
  ) {
    check(userId, String);
    check(enable, Boolean);
    check(relatedId, Match.Optional(String));
    check(reason, String);

    const relatedIds = [userId];
    if (relatedId) {
      relatedIds.push(relatedId);
    }
    await Log.record("Profile.Notifications", relatedIds, {
      userId,
      enable,
      reason,
    });

    await Users.updateAsync(userId, {
      $set: { notifications: enable },
    });
  }

  /**
   * Handle unsubscribe token
   * @param token the unsubscribe token passed by the user
   * @return whether the token was accepted
   */
  export async function unsubscribe(token: string) {
    check(token, String);

    // Find the relevant notification result
    const accepted = (
      await Promise.all(
        await Log.find({
          rel: token,
        }).mapAsync(async (entry) => {
          const body = entry.body as { unsubToken: string; recipient: string };
          // See whether it was indeed a secret token.
          // This check is not redundant because public ID like group ID
          // are also written into the rel-index and would be found if provided.
          if (body.unsubToken === token) {
            await Notifications.change(body.recipient, false, entry._id, "unsubscribe token");
            return true;
          }
          return false;
        }),
      )
    ).some((r) => r);
    return accepted;
  }
}

export namespace PrivateMessages {
  /**
   * Update the receive private messages setting for a user
   * @param userId update the setting for this user
   * @param enable new state of the flag
   * @param relatedId related ID for the Log (optional)
   */
  export async function change(
    userId: string,
    enable: boolean,
    relatedId: string | undefined,
    reason: string,
  ) {
    check(userId, String);
    check(enable, Boolean);
    check(relatedId, Match.Optional(String));
    check(reason, String);

    const relatedIds = [userId];
    if (relatedId) {
      relatedIds.push(relatedId);
    }
    await Log.record("Profile.PrivateMessages", relatedIds, {
      userId,
      enable,
      reason,
    });

    await Users.updateAsync(userId, {
      $set: { allowPrivateMessages: enable },
    });
  }

  /**
   * Handle unsubscribe from private messages token
   * @param token the unsubscribe token passed by the user
   * @return whether the token was accepted
   */
  export async function unsubscribe(token: string): Promise<boolean> {
    check(token, String);

    // Find the relevant private message result
    const accepted = (
      await Promise.all(
        await Log.find({
          rel: token,
        }).mapAsync(async (entry) => {
          const body = entry.body as { unsubToken: string; recipient: string };
          // See whether it was indeed a secret token.
          // This check is not redundant because public ID like group ID
          // are also written into the rel-index and would be found if provided.
          if (body.unsubToken === token) {
            await PrivateMessages.change(body.recipient, false, entry._id, "unsubscribe token");
            return true;
          }
          return false;
        }),
      )
    ).some((r) => r);
    return accepted;
  }
}

export namespace Region {
  /**
   * Update the selected region for a user
   * @param userId update region for this user
   * @param regionId choose this region for this user
   *
   * @return whether the change was accepted
   */
  export async function change(userId: string, regionId: string, reason: string) {
    check(userId, String);
    check(regionId, String);
    check(reason, String);

    const region = await Regions.findOneAsync(regionId);
    const accepted = !!region;

    await Log.record("Profile.Region", [userId, regionId], {
      userId,
      regionId,
      accepted,
      reason,
    });

    if (accepted) {
      await Users.updateAsync(userId, { $set: { "profile.regionId": region._id } });
    }

    return accepted;
  }
}

export namespace AvatarColor {
  /**
   * Update the user's color preference
   * @param userId update color for this user
   * @param color hsl color hue (0 - 360)
   */
  export async function change(userId: string, color: number) {
    check(userId, String);
    check(color, Number);

    // check if color is a valid hsl hue
    const accepted = color >= 0 && color <= 360;

    await Log.record("Avatar.Color", [userId], {
      userId,
      color,
      accepted,
    });

    if (accepted) {
      await Users.updateAsync(userId, { $set: { "avatar.color": color } });
    }

    return accepted;
  }
}

export namespace Description {
  /**
   * Update the user's description
   * @param userId update color for this user
   * @param description user description
   */
  export async function change(userId: string, description: string) {
    check(userId, String);
    check(description, String);

    let result;
    let success;

    try {
      result = await Users.updateAsync(userId, {
        $set: { description },
      });
      success = result > 0;
    } catch (e) {
      result = e;
      success = false;
    }
    await Log.record("Profile.Description", [userId], {
      userId,
      description,
      success,
      result,
      cause: "profile change",
    });

    return success;
  }
}
