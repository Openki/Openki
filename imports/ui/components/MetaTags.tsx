import React from "react";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { textPlain } from "/imports/utils/html-tools";
import { truncate } from "lodash-es";

function getSiteDefaultImage() {
  const ogLogo = PublicSettings.ogLogo.src;

  if (ogLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
    // in our s3 file storage
    return ogLogo;
  }

  // in the openki repository folder "public/logo/"
  return Meteor.absoluteUrl(`logo/${ogLogo}`);
}

const separatorRegExp = /(,|;|:|-)? +/;

export function MetaTags({
  title,
  description = "",
  image = "",
}: {
  title: string;
  description?: string | undefined;
  image?: string | undefined;
}) {
  // try splitting inside words to a good length for search services
  description = truncate(textPlain(description || ""), { length: 160, separator: separatorRegExp });

  return (
    <>
      <title>{`${PublicSettings.siteName} - ${title}`}</title>
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={PublicSettings.siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={image || getSiteDefaultImage()} />

      {/* Twitter */}
      <meta name="twitter:card" content={!image ? "summary" : "summary_large_image"} />
      <meta name="twitter:site" content={PublicSettings.siteName} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:image" content={image || getSiteDefaultImage()} />

      {/* Optional description */}
      {!!description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}
    </>
  );
}
