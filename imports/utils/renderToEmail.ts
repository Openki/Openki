import { Meteor } from "meteor/meteor";
import { ReactNode } from "react";

export async function renderToEmail(element: ReactNode) {
  if (Meteor.isServer) {
    const { renderToStaticMarkup } = await import("react-dom/server");
    // NOTE: `webpackIgnore: true` ensures that Rspack only resolves `juice` during runtime.
    // Otherwise, the server runtime crashes, because Meteor can not handle the
    // import attributes syntax. Example: `import * from "" with { type: "json" }`
    //
    // This workaround can be removed when Meteor replaces Babel or adds the relevant Babel plugin.
    const juice = (await import(/* webpackIgnore: true */ "juice")).default;

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
