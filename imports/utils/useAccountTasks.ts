import { useLayoutEffect, useState } from "react";

import { useSessionEquals, useUserId } from "/imports/utils/react-meteor-data";

export function useAccountTasks() {
  const [actionActive, setActionActive] = useState(false);
  const [openedLogin, setOpenedLogin] = useState(false);
  const userId = useUserId();
  const notPleaseLogin = useSessionEquals("pleaseLogin", false);

  const [currentResolve, setCurrentResolve] = useState<((loggedIn: boolean) => void) | undefined>(
    undefined,
  );
  const [visitorUserAllowed, setVisitorUserAllowed] = useState(false);

  useLayoutEffect(() => {
    if (actionActive) {
      if (userId) {
        setActionActive(false);
        setOpenedLogin(false);

        // if the user is logged in, give back true
        currentResolve?.(true);
        setCurrentResolve(undefined);
      } else if (!openedLogin) {
        // if the user is not logged in open up the login window
        Session.set("visitorUserAllowed", visitorUserAllowed);
        Session.set("pleaseLogin", true);
        setOpenedLogin(true);
      } else if (notPleaseLogin) {
        setActionActive(false);
        setOpenedLogin(false);

        // if the user closed the login window without logged in, give back false
        currentResolve?.(false);
        setCurrentResolve(undefined);
      }
    }
  }, [actionActive, userId, openedLogin, notPleaseLogin]);

  return {
    /**
     * in a frame (eg. /frame/program, with the height plugin) we need to set the
     * position of the login modal
     * @param event the event triggered by the user
     */
    adjustLoginModalPosition: (event: Event) => {
      const rect = ((event as any).submitter || event.currentTarget).getBoundingClientRect();
      Session.set("top", rect.top + rect.height / 2);
    },

    /**
     * Shows login modal if user is not logged in.
     * @returns `true` if the user is logged in; `false` it the user canceled the login
     */
    promptToLogin: (visitorUserAllowed = false) => {
      return new Promise<boolean>((resolve) => {
        setCurrentResolve(() => resolve);
        setVisitorUserAllowed(visitorUserAllowed);
        setActionActive(true);
      });
    },
  };
}
