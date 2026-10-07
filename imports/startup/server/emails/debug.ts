import fs from "node:fs";
import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { normalize } from "node:path";
import { mkdir } from "node:fs/promises";

if (Meteor.isDevelopment) {
  const debugEmailDir = normalize(`${process.env.PWD}/.temp/`);
  await mkdir(debugEmailDir, { recursive: true });

  Email.customTransport = () => {
    // disable email log See: https://docs.meteor.com/api/email.html#Email-customTransport
  };

  // Create /.temp to output emails as html files for testing
  Email.hookSend((email) => {
    if ("mailComposer" in email) {
      throw new Error("Expected HTML email but got mailComposer");
    }
    const emailContent = email.html?.toString();
    if (!emailContent) {
      throw new Error("Failed to render email", { cause: email });
    }
    fs.writeFile(
      normalize(`${debugEmailDir}/${new Date().toISOString()} ${email.subject}.html`),
      emailContent,
      // oxlint-disable-next-line no-empty-function
      () => {},
    );

    return true;
  });
}
