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
