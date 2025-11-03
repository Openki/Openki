import { truncate } from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { VenueModel } from "/imports/api/venues/venues";

import { textPlain } from "/imports/utils/html-tools";
import * as Metatags from "/imports/utils/metatags";

import { Display } from "../../components/venues/display";
import { Edit, Props as EditProps } from "../../components/venues/edit";

export function VenueDetailsPage({ venue, isNew }: { venue: VenueModel; isNew: boolean }) {
  const { t } = useTranslation();

  const [editing, setEditing] = useState(isNew);

  function editAttr(): EditProps {
    return {
      venue,
      onSaved: () => setEditing(false),
      onCanceled: () => setEditing(false),
    };
  }

  useEffect(() => {
    let title;
    if (venue._id) {
      title = venue.name;
    } else {
      title = t("venue.edit.siteTitle.create", "Create Venue");
    }
    Metatags.setCommonTags(title, truncate(textPlain(venue?.description || ""), { length: 160 }));
  });

  return (
    <div className="container mw-md">
      {editing ? (
        <Edit {...editAttr()} />
      ) : (
        <Display venue={venue} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("VenueDetailsPage", () => VenueDetailsPage);
