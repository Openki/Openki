RouterAutoscroll = {
  marginTop: 0,
  cancelNext: function() {
    cancelNext = true;
  }
};

var backToPosition;
// Saved positions will survive a hot code push
var scrollPositions = new ReactiveDict("okgrow-router-autoscroll");

var cancelNext = false;

function saveScrollPosition () {
  scrollPositions.set(window.location.href, scrollTop());
}

//TODO use history state so we don't litter
window.onpopstate = function () {
  backToPosition = scrollPositions.get(window.location.href);
};

// Scroll to the right place after changing routes. "The right place" is:
// 1. The previous position if we're returning via the back button
// 2. The element whose id is specified in the URL hash
// 3. The top of page otherwise
function getScrollToPosition () {
  if (backToPosition) {
    var oldPosition = backToPosition;
    backToPosition = undefined;
    return oldPosition;
  }

  var id = window.location.hash.replace("#", '');
  var element;

  if (cancelNext) {
    cancelNext = false;
    return undefined;
  }

  element = document.getElementById(id);
  if (element) {
    return element.getBoundingClientRect().top + scrollTop();
  }

  return 0;
}

RouterAutoscroll.scheduleScroll = function () {
  Tracker.afterFlush(function () {
    Meteor.defer(function () {
      var position = getScrollToPosition();
      scrollToPos(position);
    });
  });
};

function ironWhenReady(callFn) {
  return function () {
    var self = this;
    if (self.ready()) {
      var position = getScrollToPosition();
      scrollToPos(position);
    }
  };
}

// use _jQuery if available, otherwise support IE9+
var scrollTop = function () {
  // uses solution from http://stackoverflow.com/questions/871399/cross-browser-method-for-detecting-the-scrolltop-of-the-browser-window
  return document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
};

var scrollToPos = function (position) {
  if (position === undefined) return;

  window.scroll(0, position - RouterAutoscroll.marginTop);
};

if (Package['iron:router']) {
  Package['iron:router'].Router.onAfterAction(ironWhenReady(RouterAutoscroll.scheduleScroll));
  Package['iron:router'].Router.onStop(saveScrollPosition);
}

RouterAutoscroll.scrollPositions = scrollPositions;
