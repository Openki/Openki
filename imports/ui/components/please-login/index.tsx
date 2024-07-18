import React, { useEffect, useState } from "react";

import { useSessionEquals, useUserId } from "/imports/utils/react-meteor-data";

interface AutoProps {
  type: "auto";
  onRender: () => void;
}

interface FormProps {
  type: "form";
  onSubmit: () => void;
}

interface ButtonProps {
  type: "button";
  onClick: () => void;
  disabled?: boolean | undefined;
}
interface Props {
  type: "auto" | "form" | "button";
  visitorUserAllowed?: boolean;
  className?: string | undefined;
  children?: any;
}

export function PleaseLogin(props: Props & (AutoProps | FormProps | ButtonProps)) {
  const [actionActive, setActionActive] = useState(props.type === "auto");
  const [openedLogin, setOpenedLogin] = useState(false);
  const userId = useUserId();
  const notPleaseLogin = useSessionEquals("pleaseLogin", false);

  useEffect(() => {
    if (actionActive) {
      if (userId) {
        setActionActive(false);
        // if the user is logged in call the save function
        switch (props.type) {
          case "auto":
            props.onRender();
            break;
          case "form":
            props.onSubmit();
            break;
          case "button":
            props.onClick();
            break;
          default:
            throw new Error("Unexpected value: type");
        }
      } else if (!openedLogin) {
        // if the user is not logged in open up the login window
        Session.set("visitorUserAllowed", props.visitorUserAllowed || false);
        Session.set("pleaseLogin", true);
        setOpenedLogin(true);
      } else if (notPleaseLogin) {
        // if the user closed the login window without logged in reset without call the save function
        setActionActive(false);
        setOpenedLogin(false);
      }
    }
  }, [actionActive, userId, openedLogin, notPleaseLogin, props]);

  function handleEvent(event: { preventDefault: () => void }) {
    event.preventDefault();
    setActionActive(true);
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
        <button className={props.className} onClick={handleEvent} disabled={props.disabled}>
          {props.children}
        </button>
      );
    default:
      return props.children || null;
  }
}
