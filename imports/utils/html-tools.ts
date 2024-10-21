import sanitizeHtml from "sanitize-html";
import { check } from "meteor/check";
import { UnsafeString } from "./CustomChecks";

/**
 * Turn plaintext into HTML by replacing HTML characters with their entities
 * and newlines with break-tags.
 *
 * @param text input text
 * @return HTMLized version of text
 */
export function plainToHtml(text: string) {
  check(text, String);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/(?:\r\n|\r|\n)/g, "<br />")
    .replace(
      /(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|;])/gi,
      "<a href='$1'>$1</a>",
    );
}

export function saneHtml(unsaneHtml: string | UnsafeString): string {
  // 640 k ought to be enough for everybody  -- Mao
  // String-truncating HTML may leave a broken tag at the end
  // The sanitizer will have to clean the mess.
  const shortenUnsaneHtml = (unsaneHtml as string).substring(0, 640 * 1024).trim();

  // The rel=nofollow is added so that our service is less attractive to forum spam
  const options = {
    allowedTags: ["br", "p", "b", "i", "u", "a", "h4", "ul", "ol", "li"],
    allowedAttributes: {
      a: ["href", "rel"],
    },
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "nofollow" }, true) },
  };

  return sanitizeHtml(shortenUnsaneHtml, options);
}

export function textPlain(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
