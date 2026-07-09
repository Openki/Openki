import { Accounts } from "meteor/accounts-base";
import { Log } from "/imports/api/log/log";
import { LogEntity } from "/imports/api/log/factory";

/**
 * Record a login attempt in the log
 *
 * @param track The Log track. @see {LogEntity.tr}
 */
const registerAttempt =
  (track: LogEntity["tr"]) => async (attempt: { user: { _id: string; username: string } }) => {
    const body = { ...attempt } as unknown as {
      userId: string;
      username?: string;
      visitor?: boolean;
      methodName: string;
      methodArguments: Record<string, unknown>[];
    };
    if (attempt.user) {
      body.userId = attempt.user._id;

      if (attempt.user.username) {
        body.username = attempt.user.username;
      } else {
        body.visitor = true;
      }
    }

    // Delete sensitive data that should never be stored in the log.
    // 1) User object contains too much (secret) info
    delete (body as any).user;

    // 2) Delete any sensitive arguments, but preserve the non-sensitive details.
    // This allows storing details about created users for example.
    for (const argument of body.methodArguments) {
      delete argument?.password;
    }

    const rel = [];
    if (body.userId) {
      rel.push(body.userId);
    }

    await Log.record(track, rel, body);
  };

Accounts.onLogin(registerAttempt("Login.Success"));
Accounts.onLoginFailure(registerAttempt("Login.Failure"));
Accounts.onLogout(registerAttempt("Logout"));
