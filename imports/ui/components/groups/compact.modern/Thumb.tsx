import React from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";
import { GroupModel } from "/imports/api/groups/groups";
import { Router } from "meteor/iron:router";

export interface Props {
  group: GroupModel;
}

export function Thumb({ group }: Props) {
  const viewport = useViewportSize();
  const isMobileScreen = viewport.width <= ScssVars.screenSM;

  return (
    <div
      className="card me-1"
      style={isMobileScreen ? { width: 270, minWidth: 270 } : { width: 320, minWidth: 320 }}
    >
      {group?.publicUrlForCompactImage() ? (
        <div
          className="position-relative card-header bg-img-cover border-bottom"
          style={{ backgroundImage: `url('${group.publicUrlForCompactImage()}')`, height: "160px" }}
        />
      ) : (
        <ImagePlaceholder seed={group._id} regionId={group.region} />
      )}
      <div className="card-body">
        <h3 className="card-title line-clamp-2 min-h-[2lh] fw-bold text-body">{group.name}</h3>

        <a
          className="stretched-link icon-link icon-link-hover fs-4 text-dark"
          href={Router.path("showGroup", group)}
        >
          <i className="fa-solid fa-arrow-right-long bi"></i>
        </a>
      </div>
    </div>
  );
}
