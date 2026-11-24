import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { serverError } from "/imports/api/log/methods";

WebApp.handlers.use("/robots.txt", (_req, res) => {
  try {
    res.type("text/plain");

    let body = `Sitemap: ${Meteor.absoluteUrl("sitemap.xml")}\n`;

    if (PrivateSettings.robots === false) {
      body += `
User-agent: *
Disallow: /
`.trimStart();
    } else {
      body += `
User-agent: *
Disallow: /api/
Disallow: /admin/
Disallow: /kiosk/
Disallow: /cal/
Disallow: /tenant/
Disallow: /region/
Disallow: /*?categories=
Disallow: /verify-email/
Disallow: /reset-password/
`.trimStart();
      if (PrivateSettings.hideProfiles === true) {
        body += "Disallow: /user/\n";
      } else {
        body += "Disallow: \n";
      }
    }
    res.status(200).send(body);
  } catch (e) {
    res.sendStatus(500);
    serverError(e);
  }
});
