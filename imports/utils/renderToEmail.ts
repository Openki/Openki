import { Meteor } from "meteor/meteor";
import { ReactNode } from "react";

export async function renderToEmail(element: ReactNode) {
  if (Meteor.isServer) {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const juice = (await import("juice")).default;
    // react can't handle DOCTYPE header, so we add the thing here.
    return juice(
      `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
${renderToStaticMarkup(element).replaceAll("&#x27;", "'").replaceAll("&quot;", '"').replaceAll("&amp;", "&")}
</html>`,
    );
  }

  return "";
}
