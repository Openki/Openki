import { DocHead } from "meteor/kadira:dochead";
import { Meteor } from "meteor/meteor";

import { PublicSettings } from "/imports/utils/PublicSettings";

// See: https://guide.meteor.com/deployment.html#seo

function getSiteDefaultImage() {
  const ogLogo = PublicSettings.ogLogo.src;

  if (ogLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
    // in our s3 file storage
    return ogLogo;
  }

  // in the openki repository folder "public/logo/"
  return Meteor.absoluteUrl(`logo/${ogLogo}`);
}

export function removeAll() {
  DocHead.setTitle(PublicSettings.siteName);
  DocHead.removeDocHeadAddedTags();
}

export function setCommonTags(title: string, description = "", image = "") {
  DocHead.setTitle(`${PublicSettings.siteName} - ${title}`);

  DocHead.addMeta({ property: "og:type", content: "website" });
  DocHead.addMeta({ property: "og:site_name", content: PublicSettings.siteName });
  DocHead.addMeta({ property: "og:title", content: title });
  DocHead.addMeta({ property: "og:image", content: image || getSiteDefaultImage() });

  DocHead.addMeta({ name: "twitter:card", content: "summary" });
  DocHead.addMeta({ name: "twitter:site", content: PublicSettings.siteName });
  DocHead.addMeta({ name: "twitter:title", content: title });
  DocHead.addMeta({ name: "twitter:image", content: image || getSiteDefaultImage() });

  if (description) {
    DocHead.addMeta({ name: "description", content: description });
    DocHead.addMeta({ property: "og:description", content: description });
    DocHead.addMeta({ name: "twitter:description", content: description });
  }
}
