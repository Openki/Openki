import * as HtmlTools from "/imports/utils/html-tools";

describe("Converting Text to HTML", () => {
  it("turns linebreak into break-tag", () => {
    assert.include(HtmlTools.plainToHtml("a\nb"), "<br");
  });
  it("escapes angle brackets", () => {
    assert.notInclude(HtmlTools.plainToHtml("<><"), "<");
  });
  it("hyperlinks links", () => {
    const url = "https://openki.net";
    const html = HtmlTools.plainToHtml(url);
    assert.include(html, "href");
    assert.include(html, url);
  });
  it(`sanitized hyperlinks are valid and include rel="nofollow"`, () => {
    const link = "https://openki.net";
    const html = HtmlTools.plainToHtml(link);

    assert.include(HtmlTools.sanitizeHtml(html), `href="${link}"`);
    assert.include(HtmlTools.sanitizeHtml(html), 'rel="nofollow"');
  });
  it("hyperlinks ampersand url", () => {
    const url = "https://openki.net/?&";
    const html = HtmlTools.plainToHtml(url);
    assert.include(html, "&amp;");
  });
});
