import React from "react";
import { useDetails } from "/imports/api/regions/publications";

export function ImagePlaceholder({
  seed,
  regionId,
  children,
}: {
  seed: string;
  regionId: string;
  children: any;
}) {
  const [isLoading, region] = useDetails(regionId);

  if (isLoading() || !region || !region.custom?.courseBackgroundImages) {
    return (
      <div className="position-relative card-header card-header-img bg-img-cover border-bottom">{children}</div>
    );
  }

  const images = region.custom.courseBackgroundImages;

  // "random" chooses of a image from the regions courseBackgroundImages setting
  let imageIndex = 0;
  for (let i = 0; i < seed.length; i++) {
    imageIndex = (imageIndex + seed.charCodeAt(i)) % images.length;
  }

  return (
    <div
      className="position-relative card-header card-header-img bg-img-cover border-bottom"
      style={{ backgroundImage: `url('${images[imageIndex]}')` }}
    >
      {children}
    </div>
  );
}
