import { Accounts } from "meteor/accounts-base";
import { Log } from "/imports/api/log/log";

// Record a login attempt in the log
const registerAttempt =
  (track: string) => async (attempt: { user: { _id: string; username: string } }) => {
    const body = { ...attempt } as unknown as {
      userId: string;
      username?: string;
      visitor?: boolean;
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
    // 2) Details about the login attempt
    delete (body as any).methodArguments;

    const rel = [];
    if (body.userId) {
      rel.push(body.userId);
    }

    await Log.record(track, rel, body);
  };

Accounts.onLogin(registerAttempt("Login.Success"));
Accounts.onLoginFailure(registerAttempt("Login.Failure"));
Accounts.onLogout(registerAttempt("Logout"));
