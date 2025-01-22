import { Blaze } from "meteor/blaze";
import { Spacebars } from "meteor/spacebars";

/**
 * Truncate long strings, adding ellipsis char when the string was long
 *
 * @param src the string to be truncated
 * @param max the maximum length of the string
 * @param ellipsis the string to add that signifies that src was truncated,
 * preset "…", does not count towards max.
 */
export function truncate(src: string, max: number, ellipsis = "…") {
  if (src.length > max) {
    return src.substring(0, max) + ellipsis;
  }
  return src;
}

export function markedName(search: string, name: string) {
  if (search === "") {
    return name;
  }
  const match = name.match(new RegExp(search, "i"));

  // To add markup we have to escape all the parts separately
  let marked;
  if (match) {
    const term = match[0];
    const parts = name.split(term);
    marked = parts.map(Blaze._escape).join(`<strong>${Blaze._escape(term)}</strong>`);
  } else {
    marked = Blaze._escape(name);
  }
  return Spacebars.SafeString(marked);
}

/**
 * Create a URL friendly version from the string. Source: https://stackoverflow.com/questions/37809/how-do-i-generate-a-friendly-url-in-c
 */
export function slug(text: string) {
  return (
    text
      // make it all lower case
      .toLowerCase()

      // https://meta.stackexchange.com/questions/7435/non-us-ascii-characters-dropped-from-full-profile-url/7696#7696
      .replace(/[ä]/g, "ae")
      .replace(/[àåáâãåą]/g, "a")
      .replace(/[èéêëę]/g, "e")
      .replace(/[ìíîïı]/g, "i")
      .replace(/[ö]/g, "oe")
      .replace(/[òóôõøőð]/g, "o")
      .replace(/[ü]/g, "ue")
      .replace(/[ùúûŭů]/g, "u")
      .replace(/[çćčĉ]/g, "c")
      .replace(/[żźž]/g, "z")
      .replace(/[śşšŝ]/g, "s")
      .replace(/[ñń]/g, "n")
      .replace(/[ýÿ]/g, "y")
      .replace(/[ğĝ]/g, "g")
      .replace(/[ř]/g, "r")
      .replace(/[ł]/g, "l")
      .replace(/[đ]/g, "d")
      .replace(/[ß]/g, "ss")
      .replace(/[Þ]/g, "th")
      .replace(/[ĥ]/g, "h")
      .replace(/[ĵ]/g, "j")

      // remove anything that is not letters, numbers, dash, or space
      .replace(/[^a-z0-9-\s]/g, "")

      // replace spaces
      .replace(/\s+/g, "-")

      // collapse dashes
      .replace(/-+/g, "-")

      // trim excessive dashes at the beginning
      .replace(/^-/g, "")

      // if it's too long, clip it
      .substring(0, 80)

      // remove trailing dashes
      .replace(/-$/g, "")
  );
}

export function escapeRegex(string: string) {
  return string.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
}

/**
 * Remove non-printable chars from string
 */
export function sanitizeMultiline(unsafeString: string) {
  // Remove all ASCII control chars except the line feed.
  /* eslint-disable-next-line no-control-regex */
  const re = /[\0-\x09\x0B-\x1F\x7F]/g;
  const text = unsafeString.replace(re, "");

  return text.trim();
}

/**
 * Remove non-printable chars and linebreaks from string
 * All runs of whitespace are replaced with one space.
 */
export function sanitizeSingleline(unsafeString: string) {
  let text = unsafeString.replace(/[\n\r]/g, "");
  text = text.replace(/\s+/g, " ");
  return sanitizeMultiline(text);
}
