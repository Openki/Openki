import React, { SubmitEvent, ReactNode, useLayoutEffect, useState } from "react";

import { useSessionEquals, useUserId } from "/imports/utils/react-meteor-data";
import { Content } from "/imports/ui/components/Buttons";

export function Button({
  visitorUserAllowed,
  beforeClick,
  onAbort,
  busyText,
  ...props
}: {
  visitorUserAllowed?: boolean | undefined;
  beforeClick?: (() => undefined | boolean) | undefined;
  onClick: () => void | Promise<void>;
  onAbort?: (() => void) | undefined;
  busyText?: string | undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [actionActive, setActionActive] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [openedLogin, setOpenedLogin] = useState(false);
  const userId = useUserId();
  const notPleaseLogin = useSessionEquals("pleaseLogin", false);

  useLayoutEffect(() => {
    if (actionActive) {
      if (userId) {
        setActionActive(false);
        (async function () {
          try {
            await props.onClick();
          } finally {
            setIsBusy(false);
          }
        })();
      } else if (!openedLogin) {
        // if the user is not logged in open up the login window
        Session.set("visitorUserAllowed", visitorUserAllowed || false);
        Session.set("pleaseLogin", true);
        setOpenedLogin(true);
      } else if (notPleaseLogin) {
        // if the user closed the login window without logged in reset without call the save function
        setActionActive(false);
        setOpenedLogin(false);
        setIsBusy(false);
        onAbort?.();
      }
    }
  }, [actionActive, userId, openedLogin, notPleaseLogin, props]);

  async function handleEvent(event: { preventDefault: () => void; target: EventTarget }) {
    event.preventDefault();

    if (beforeClick?.() === false) {
      // when beforeClick returns false, we abort
      onAbort?.();
      return;
    }

    setActionActive(true);

    /* in a frame (eg. /frame/program, with the height plugin we need to set the position of the login modal) */
    if (document.querySelector(".frame")) {
      Session.set("top", (event.target as HTMLElement).getBoundingClientRect().top);
    }

    setIsBusy(true);
  }

  return (
    <button {...props} onClick={handleEvent}>
      <Content isBusy={isBusy} busyText={busyText}>
        {props.children}
      </Content>
    </button>
  );
}

export function Form({
  visitorUserAllowed,
  beforeSubmit,
  onAbort,
  ...props
}: {
  visitorUserAllowed?: boolean | undefined;
  beforeSubmit?: (() => undefined | boolean) | undefined;
  onSubmit: () => void | Promise<void>;
  onAbort?: (() => void) | undefined;
} & React.FormHTMLAttributes<HTMLFormElement>) {
  const [actionActive, setActionActive] = useState(false);
  const [openedLogin, setOpenedLogin] = useState(false);
  const userId = useUserId();
  const notPleaseLogin = useSessionEquals("pleaseLogin", false);

  useLayoutEffect(() => {
    if (actionActive) {
      if (userId) {
        setActionActive(false);
        (async function () {
          await props.onSubmit();
        })();
      } else if (!openedLogin) {
        // if the user is not logged in open up the login window
        Session.set("visitorUserAllowed", visitorUserAllowed || false);
        Session.set("pleaseLogin", true);
        setOpenedLogin(true);
      } else if (notPleaseLogin) {
        // if the user closed the login window without logged in reset without call the save function
        setActionActive(false);
        setOpenedLogin(false);
        onAbort?.();
      }
    }
  }, [actionActive, userId, openedLogin, notPleaseLogin, props]);

  async function handleEvent(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (beforeSubmit?.() === false) {
      // when beforeSubmit returns false, we abort, eg. when validation fails
      onAbort?.();
      return;
    }

    setActionActive(true);

    /* in a frame (eg. /frame/program, with the height plugin we need to set the position of the login modal) */
    if (document.querySelector(".frame")) {
      const rect = ((event as any).submitter || event.currentTarget).getBoundingClientRect();
      Session.set("top", rect.top + rect.height / 2);
    }
  }

  return (
    <form {...props} onSubmit={handleEvent}>
      {props.children}
    </form>
  );
}

export function Action(props: {
  visitorUserAllowed?: boolean;
  children?: ReactNode | undefined;
  onRender: () => Promise<void>;
  onAbort?: (() => void) | undefined;
}) {
  const [actionActive, setActionActive] = useState(true);
  const [openedLogin, setOpenedLogin] = useState(false);
  const userId = useUserId();
  const notPleaseLogin = useSessionEquals("pleaseLogin", false);

  useLayoutEffect(() => {
    if (actionActive) {
      if (userId) {
        setActionActive(false);
        (async function () {
          await props.onRender();
        })();
      } else if (!openedLogin) {
        // if the user is not logged in open up the login window
        Session.set("visitorUserAllowed", props.visitorUserAllowed || false);
        Session.set("pleaseLogin", true);
        setOpenedLogin(true);
      } else if (notPleaseLogin) {
        // if the user closed the login window without logged in reset without call the save function
        setActionActive(false);
        setOpenedLogin(false);
        props.onAbort?.();
      }
    }
  }, [actionActive, userId, openedLogin, notPleaseLogin, props]);

  return props.children || null;
}
