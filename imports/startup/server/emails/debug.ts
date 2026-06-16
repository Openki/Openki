import fs from "fs";
import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { normalize } from "node:path";

if (Meteor.isDevelopment) {
  Email.customTransport = () => {
    // disable email log See: https://docs.meteor.com/api/email.html#Email-customTransport
  };

  // Create /.temp to output emails as html files for testing
  Email.hookSend((email: any) => {
    fs.writeFile(
      normalize(`${process.env.PWD}/.temp/${new Date().toISOString()} ${email.subject}.html`),
      email.html,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );

    return true;
  });
}
