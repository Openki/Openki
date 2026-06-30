import fs from "fs";
import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { normalize } from "node:path";
import { mkdir } from "fs/promises";

if (Meteor.isDevelopment) {
  const debugEmailDir = `${process.env.PWD}/.temp/`
  await mkdir(debugEmailDir, { recursive: true });

  Email.customTransport = () => {
    // disable email log See: https://docs.meteor.com/api/email.html#Email-customTransport
  };

  // Create /.temp to output emails as html files for testing
  Email.hookSend((email: any) => {
    fs.writeFile(
      normalize(`${debugEmailDir}/${new Date().toISOString()} ${email.subject}.html`),
      email.html,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );

    return true;
  });
}
