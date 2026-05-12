import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { WebApp } from "meteor/webapp";

import { serverError } from "/imports/api/log/methods";

WebApp.handlers.use("/robots.txt", (_req, res) => {
  try {
    res.writeHead(200, { "Content-Type": "text/plain" });

    res.write(`Sitemap: ${Meteor.absoluteUrl("sitemap.xml")}\n`);
    if (PrivateSettings.robots === false) {
      res.write("User-agent: *\n");
      res.write("Disallow: /\n");
    } else {
      res.write("User-agent: *\n");
      res.write("Disallow: /api/\n");
      res.write("Disallow: /admin/\n");
      res.write("Disallow: /kiosk/\n");
      res.write("Disallow: /cal/\n");
      res.write("Disallow: /tenant/\n");
      res.write("Disallow: /region/\n");
      res.write("Disallow: /*?categories=\n");
      res.write("Disallow: /verify-email/\n");
      res.write("Disallow: /reset-password/\n");
      if (PrivateSettings.hideProfiles === true) {
        res.write("Disallow: /user/\n");
      } else {
        res.write("Disallow: \n");
      }
    }
    res.end();
  } catch (e) {
    res.writeHead(500).end();
    serverError(e);
  }
});
