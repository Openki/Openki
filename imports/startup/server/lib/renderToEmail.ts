import { renderToStaticMarkup } from "react-dom/server";
import juice from "juice";

export function renderToEmail(element: React.ReactNode) {
  // react can't handle DOCTYPE header, so we add the thing here.
  return juice(
    `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
${renderToStaticMarkup(element)}
</html>`,
  );
}
