import React, { useLayoutEffect, useState } from "react";

import { useSessionEquals, useUserId } from "/imports/utils/react-meteor-data";

interface AutoProps {
  type: "auto";
  onRender: () => Promise<void>;
}
interface FormProps {
  type: "form";
  onSubmit: () => Promise<void>;
}
interface ButtonProps {
  "data-test"?: string;
  type: "button";
  onClick: () => Promise<void>;
  disabled?: boolean | undefined;
  busyText?: string | undefined;
}
interface Props {
  type: "auto" | "form" | "button";
  visitorUserAllowed?: boolean;
  className?: string | undefined;
  children?: any;
}

export function PleaseLogin(props: Props & (AutoProps | FormProps | ButtonProps)) {
  const [actionActive, setActionActive] = useState(props.type === "auto");
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
            // if the user is logged in call the save function
            switch (props.type) {
              case "auto":
                await props.onRender();
                break;
              case "form":
                await props.onSubmit();
                break;
              case "button":
                await props.onClick();
                break;
              default:
                throw new Error("Unexpected value: type");
            }
          } finally {
            setIsBusy(false);
          }
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
        setIsBusy(false);
      }
    }
  }, [actionActive, userId, openedLogin, notPleaseLogin, props]);

  async function handleEvent(event: { preventDefault: () => void; target: EventTarget }) {
    event.preventDefault();
    setActionActive(true);

    /* in a frame (eg. /frame/program, with the height plugin we need to set the position of the login modal) */
    if (document.querySelector(".frame")) {
      Session.set("top", (event.target as HTMLElement).getBoundingClientRect().top);
    }

    setIsBusy(true);
  }

  switch (props.type) {
    case "form":
      return (
        <form className={props.className} onSubmit={handleEvent}>
          {props.children}
        </form>
      );
    case "button":
      return (
        <button
          data-test={props["data-test"] || "please-login-button"}
          className={props.className}
          disabled={props.disabled}
          onClick={handleEvent}
        >
          {!isBusy ? (
            props.children
          ) : (
            <>
              <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
              {props.busyText}
            </>
          )}
        </button>
      );
    default:
      return props.children || null;
  }
}
