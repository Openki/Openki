import slugify from "slugify";

/**
 * Create a URL friendly version from the string.
 */
export function slug(text: string) {
  return (
    // use slugify to replace special chars
    slugify(text, {
      lower: true,
      strict: true,
    })
      // make it even more restrictive
      // replace anything that is not letters or numbers with dashes
      .replace(/[^a-z0-9]/g, "-")

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

/**
 * Remove non-printable chars from string
 */
export function sanitizeMultiline(
  text = "",
  maxLength = 640 * 1024 /* 640 k ought to be enough for everybody  -- Mao */,
) {
  // Remove all ASCII control chars except the line feed.
  /* eslint-disable-next-line no-control-regex */
  const re = /[\0-\x09\x0B-\x1F\x7F]/g;

  return text.replace(re, "").substring(0, maxLength).trim();
}

/**
 * Remove non-printable chars and linebreaks from string
 * All runs of whitespace are replaced with one space.
 */
export function sanitizeSingleline(
  text = "",
  maxLength = 640 * 1024 /* 640 k ought to be enough for everybody  -- Mao */,
) {
  const result = text.replace(/[\n\r]/g, "").replace(/\s+/g, " ");
  return sanitizeMultiline(result, maxLength);
}
