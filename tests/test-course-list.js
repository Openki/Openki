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

    // According to the testing docs, it should be possible to wait until all
    // subscriptions become ready at this point. However, for some reason that
    // does not work in this app. This can be easily verified by opening up the
    // browser and pasting the line `DDP._allSubscriptionsReady()` into the
    // console. At some point it should return `true`, but it never does (in my
    // case).
    // https://github.com/meteor/guide/blob/testing-modules-content/content/testing.md#full-app-integration-test
    //
    // browser.waitUntil(function() {
    //   var response = browser.execute(function() {
    //     return DDP._allSubscriptionsReady();
    //   });
    //   return response.value;
    // });

    // Instead we simply wait for critical elements to appear, and then each
    // test-case needs to wait again for those elements it wants to run
    // assertions against.
    // http://www.webdriver.io/api/utility/waitForExist.html
    browser.waitForExist('.course-container');
  });

  it('should list 7 courses for unauthenticated user (Testistan)', function () {
    // Wait until all courses have loaded.
    // http://www.webdriver.io/api/utility/waitUntil.html
    browser.waitUntil(function() {
      var divcount = browser.selectorExecute('.course-container', function(divs) {
        return divs.length;
      });
      return divcount == 7;
    });

    // Then collect data and assert stuff.
    var titles = browser.getText('.course-container h4');
    expect(titles[0]).to.equal('Sprachaustausch');
    expect(titles[1]).to.equal('Game Design mit Unity');
    expect(titles[2]).to.equal('Aikido');
    expect(titles[3]).to.equal('Open Lab');
    expect(titles[4]).to.equal('Ubuntu auf Mac (dual-Boot)');
    expect(titles[5]).to.equal('Lerne Russisch in 2 Stunden');
    expect(titles[6]).to.equal('Meteor.js Workshop');
  });
});
