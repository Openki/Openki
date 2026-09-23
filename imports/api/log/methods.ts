import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { serializeError } from "serialize-error";

import { Log } from "/imports/api/log/log";

import { ServerMethod } from "/imports/utils/ServerMethod";

export const ReportPattern = {
  name: String,
  message: String,
  location: String,
  stack: String,
  tsClient: Date,
  clientId: String,
  userAgent: String,
};

export type Report = Match.PatternMatch<typeof ReportPattern>;

export const clientError = ServerMethod(
  "log.clientError",
  async function (originalReport: Report) {
    check(originalReport, ReportPattern);
    const report: Report & {
      userId?: string;
      connectionId?: string | undefined;
    } = { ...originalReport };
    report.connectionId = this.connection?.id;

    const rel = [report.name, report.connectionId, report.clientId].filter(
      (id) => !!id,
    ) as string[];

    const userId = Meteor.userId();
    if (userId) {
      report.userId = userId;
      rel.push(userId);
    }
    await Log.record("clientError", rel, report);
  },
  { simulation: false },
);

/** For logging errors on the server that have occurred on the server. */
export async function serverError(error: unknown) {
  try {
    await Log.record("serverError", [], serializeError(error));
  } catch {
    // ignore
  }
}
