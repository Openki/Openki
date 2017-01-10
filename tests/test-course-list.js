describe('Frontpage', function () {
  beforeEach(function() {
    // This instructs the webdriver to load the given page. Note that this is
    // xolvio/sync-webdriverio, hence we are inside a fiber here and do not
    // need to add callbacks (i.e., do not add then()).
    // http://www.webdriver.io/api/protocol/url.html
    browser.url(process.env.ROOT_URL);

    // Navigate to the page by loading a route inside the browser.
    // http://www.webdriver.io/api/protocol/execute.html
    browser.execute(function() {
      Router.go('/');
    });

	browser.waitUntil(function() {
        var response = browser.execute(function() {
			return DDP._allSubscriptionsReady();
		});
		return response.value;
    });
  });

  it('should list 7 courses for unauthenticated user (Testistan)', function () {
    // Wait until all courses have loaded.
    // http://www.webdriver.io/api/utility/waitUntil.html
    browser.waitUntil(function() {
      var divcount = browser.selectorExecute('.course-compact-wrap', function(divs) {
        return divs.length;
      });
      return divcount == 8;
    });

    // Then collect data and assert stuff.
    var titles = browser.getText('.course-compact-wrap h4');

    expect(titles[0]).to.equal('Sprachaustausch');
    expect(titles[1]).to.equal('Game Design mit Unity');
    expect(titles[2]).to.equal('Aikido');
    expect(titles[3]).to.equal('Open Lab');
    expect(titles[4]).to.equal('First-Aid Course');
    expect(titles[5]).to.equal('Ubuntu auf Mac (dual-Boot)');
    expect(titles[6]).to.equal('Velo Flicken');
    expect(titles[7]).to.equal('Meteor.js Workshop');
  });
});
