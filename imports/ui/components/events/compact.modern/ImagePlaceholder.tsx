import React, { ReactNode } from "react";
import { useDetails } from "/imports/api/regions/publications";

export function ImagePlaceholder({
  seed,
  regionId,
  children,
}: {
  seed: string;
  regionId: string;
  children: ReactNode;
}) {
  const [isLoading, region] = useDetails(regionId);

  if (isLoading() || !region || !region.custom?.groupBackgroundImages) {
    return (
      <div className="position-relative card-header bg-img-cover border-bottom">{children}</div>
    );
  }

  const images = region.custom.groupBackgroundImages;

  // "random" chooses of a image from the regions groupBackgroundImages setting
  let imageIndex = 0;
  for (let i = 0; i < seed.length; i++) {
    imageIndex = (imageIndex + seed.charCodeAt(i)) % images.length;
  }

  return (
    <div
      className="position-relative card-header bg-img-cover border-bottom"
      style={{ backgroundImage: `url('${images[imageIndex]}')` }}
    >
      {children}
    </div>
  );
}
