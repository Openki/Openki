import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";
import { useSession, useSessionEquals } from "/imports/ui/hooks/react-meteor-data";
import { useCurrentRouteName } from "/imports/ui/hooks/react-meteor-router";

export function useShownIntro() {
  return useSessionEquals("ShowIntro", true);
}

export function useOpenedIntro() {
  const opened = useSession("OpenedIntro");
  const routeName = useCurrentRouteName();

  if (opened !== undefined) {
    return opened;
  }

  return routeName === "home";
}

export const Introduction = {
  init() {
    Session.set("ShowIntro", localStorage?.getItem("intro") !== "done");
    Session.set("OpenedIntro", undefined);
  },

  showIntro() {
    Session.set("ShowIntro", true);
    try {
      localStorage.removeItem("intro");
    } catch {
      // ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
    }
  },

  shownIntro: () => Session.equals("ShowIntro", true),

  openedIntro() {
    const opened = Session.get("OpenedIntro");
    if (opened !== undefined) {
      return opened;
    }

    const routeName = Router.current().route?.getName();
    return routeName === "home";
  },

  openIntro() {
    Session.set("OpenedIntro", true);
  },

  closeIntro() {
    Session.set("OpenedIntro", false);
  },

  doneIntro() {
    Session.set("ShowIntro", false);
    try {
      localStorage.setItem("intro", "done");
    } catch {
      // ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
    }
  },
};
