import { useLayoutEffect, useState } from "react";
import { useSessionEquals, useUser } from "/imports/ui/hooks/react-meteor-data";

import { UserModel } from "/imports/api/users/users";

export function useAccountTasks() {
  const [actionActive, setActionActive] = useState(false);
  const [openedLogin, setOpenedLogin] = useState(false);
  const user = useUser();
  const notPleaseLogin = useSessionEquals("pleaseLogin", false);

  const [currentResolve, setCurrentResolve] = useState<
    ((currentUser: UserModel | null) => void) | undefined
  >(undefined);
  const [visitorUserAllowed, setVisitorUserAllowed] = useState(false);

  useLayoutEffect(() => {
    if (actionActive) {
      if (user) {
        setActionActive(false);
        setOpenedLogin(false);

        // if the user is logged in, give back the user
        currentResolve?.(user);
        setCurrentResolve(undefined);
      } else if (!openedLogin) {
        // if the user is not logged in open up the login window
        Session.set("visitorUserAllowed", visitorUserAllowed);
        Session.set("pleaseLogin", true);
        setOpenedLogin(true);
      } else if (notPleaseLogin) {
        setActionActive(false);
        setOpenedLogin(false);

        // if the user closed the login window without logged in, give back `null`
        currentResolve?.(null);
        setCurrentResolve(undefined);
      }
    }
  }, [actionActive, user, openedLogin, notPleaseLogin]);

  return {
    /**
     * in a frame (eg. /frame/program, with the height plugin) we need to set the
     * position of the login modal
     * @param event the event triggered by the user
     */
    adjustLoginModalPosition: (event: Event) => {
      if (document.querySelector(".frame")) {
        const rect = ((event as any).submitter || event.currentTarget).getBoundingClientRect();
        Session.set("top", rect.top + rect.height / 2);
      }
    },

    /**
     * Shows login modal if user is not logged in.
     * @returns `currentUser` if the user is logged in; `null` it the user canceled the login
     */
    promptToLogin: (visitorUserAllowed = false) => {
      return new Promise<UserModel | null>((resolve) => {
        setCurrentResolve(() => resolve);
        setVisitorUserAllowed(visitorUserAllowed);
        setActionActive(true);
      });
    },
  };
}
