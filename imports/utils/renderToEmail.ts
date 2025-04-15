import { Meteor } from "meteor/meteor";

export function renderToEmail(element: React.ReactNode) {
  if (Meteor.isServer) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { renderToStaticMarkup } = require("react-dom/server");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const juice = require("juice");
    // react can't handle DOCTYPE header, so we add the thing here.
    return juice(
      `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
${renderToStaticMarkup(element).replaceAll("&#x27;", "'").replaceAll("&quot;", '"')}
</html>`,
    );
  }

  return "";
}
