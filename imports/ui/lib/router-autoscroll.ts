import { ReactiveDict } from "meteor/reactive-dict";
import { Router } from "meteor/iron:router";

import { MeteorAsync, TrackerAsync } from "/imports/utils/promisify";

function getScrollTop() {
  // uses solution from http://stackoverflow.com/questions/871399/cross-browser-method-for-detecting-the-scrolltop-of-the-browser-window
  return document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
}

async function waitUntil(conditionFn: () => boolean) {
  if (!conditionFn()) {
    await MeteorAsync.setTimeout(50);

    await waitUntil(conditionFn);
  }
}
function whenReady(callFn: () => void) {
  return async function (this: { ready: () => boolean; _rendered: boolean }) {
    if (this.ready()) {
      await waitUntil(() => this._rendered);
      callFn();
    }
  };
}

// Based on the router-autoscroll package version 0.1.8

class RouterAutoscroll {
  private backToPosition: number | undefined;

  // Saved positions will survive a hot code push
  private scrollPositions = new ReactiveDict<Record<string, number>>("okgrow-router-autoscroll");

  private _cancelNext = false;

  public marginTop = 0;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // TODO use history state so we don't litter
    window.onpopstate = () => {
      this.backToPosition = this.scrollPositions.get(window.location.href);
    };

    Router.onBeforeAction(async function (this: { next: () => void }) {
      if (!self._cancelNext) {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo({ top: 0, behavior: "auto" });
        document.documentElement.style.scrollBehavior = "";
      }

      this.next();
    });
    Router.onAfterAction(
      whenReady(() => {
        if (self._cancelNext) {
          self._cancelNext = false;
        } else {
          self.scheduleScroll();
        }
      }),
    );
    Router.onStop(() => this.saveScrollPosition());
  }

  private saveScrollPosition() {
    this.scrollPositions.set(window.location.href, getScrollTop());
  }

  // Scroll to the right place after changing routes. "The right place" is:
  // 1. The previous position if we're returning via the back button
  // 2. The element whose id is specified in the URL hash
  // 3. The top of page otherwise
  private getScrollToPosition() {
    if (this.backToPosition) {
      const oldPosition = this.backToPosition;
      this.backToPosition = undefined;
      return oldPosition;
    }

    const id = window.location.hash.replace("#", "");

    const element = id && document.getElementById(id);
    if (element) {
      return element.getBoundingClientRect().top + getScrollTop() - this.marginTop;
    }

    return 0;
  }

  private static scrollToPos(position: number | undefined) {
    if (position === undefined) return;
    window.scrollTo({ top: position, behavior: "auto" });
  }

  public async scheduleScroll() {
    await TrackerAsync.afterFlush();

    await MeteorAsync.setTimeout(200);

    const position = this.getScrollToPosition();
    RouterAutoscroll.scrollToPos(position);
  }

  /** Do not scroll the next time you normally would */
  public cancelNext() {
    this._cancelNext = true;
  }
}

export const routerAutoscroll = new RouterAutoscroll();
