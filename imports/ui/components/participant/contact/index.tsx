import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "/imports/startup/client/bootstrap";
import { useUser } from "/imports/utils/react-meteor-data";

import { GroupModel } from "/imports/api/groups/groups";
import * as emailMethods from "/imports/api/emails/methods";
import { SendPrivateMessageOptions } from "/imports/api/emails/methods";
import { EventModel } from "/imports/api/events/events";
import * as Users from "/imports/api/users/publications";

import { SendMessage, Props as SendMessageProps } from "../../SendMessage";
import { type UserModel } from "/imports/api/users/users";

export interface Props {
  participant: string;
  group?: GroupModel;
  event?: EventModel;
}

export function ParticipantContact(props: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const user = useUser();
  const [isLoading, participant] = Users.useDetails(props.participant);

  useEffect(() => {
    const element = modalRef.current;
    if (!showModal || !element) {
      return;
    }
    Modal.getOrCreateInstance(element).show();

    function hide() {
      setShowModal(false);
    }
    element.addEventListener("hidden.bs.modal", hide);
    return () => {
      element.removeEventListener("hidden.bs.modal", hide);
    };
  });

  function showParticipantContact() {
    if (!user) {
      return false;
    }

    return user._id !== props.participant;
  }

  const userHasVerifiedEmail = Boolean(user?.hasVerifiedEmail());

  function sendMessageAttr(): SendMessageProps {
    return {
      autoFocus: true,
      placeholder: t(
        "participantContact.sendMessage.placeholder",
        "Hi {USER}. I wanted to tell you…",
        { USER: participant?.getDisplayName() },
      ),
      onSend: async (message, options) => {
        const sendPrivateMessageOptions = options as SendPrivateMessageOptions;
        if (props.group) {
          sendPrivateMessageOptions.groupId = props.group?._id;
        }
        if (props.event) {
          sendPrivateMessageOptions.eventId = props.event?._id;
        }
        await emailMethods.sendPrivateMessage(
          props.participant,
          message,
          sendPrivateMessageOptions,
        );
        const element = modalRef.current;
        if (element) {
          Modal.getOrCreateInstance(element).hide();
        }
      },
    };
  }

  return (
    <>
      {showParticipantContact() && (
        <>
          <div className="d-inline-block">
            {!isLoading() &&
              (participant?.allowPrivateMessages ? (
                userHasVerifiedEmail ? (
                  <button
                    className="btn btn-link p-0"
                    type="button"
                    data-bs-title={t("user.privateMessage", "Contact directly")}
                    onClick={() => setShowModal(true)}
                  >
                    <i className="fa-solid fa-envelope fa-fw" />
                  </button>
                ) : (
                  <span
                    className="d-inline-block"
                    tabIndex={0}
                    data-bs-title={t(
                      "user.privateMessage.verifyEmail",
                      "Verify your email to send direct messages",
                    )}
                  >
                    <button className="btn btn-link p-0" type="button" disabled>
                      <i className="fa-solid fa-envelope fa-fw" />
                    </button>
                  </span>
                )
              ) : (
                <span
                  className="d-inline-block"
                  tabIndex={0}
                  data-bs-title={t(
                    "user.acceptsPrivateMessages.false",
                    "User does not accept direct messages from users",
                  )}
                >
                  <button className="btn btn-link p-0" type="button" disabled>
                    <i className="fa-solid fa-envelope fa-fw" />
                  </button>
                </span>
              ))}
          </div>
          {showModal && (
            <ParticipantContactModal
              ref={modalRef}
              sendMessageAttr={sendMessageAttr}
              participant={participant}
            />
          )}
        </>
      )}
    </>
  );
}

function ParticipantContactModal({
  ref,
  sendMessageAttr,
  participant,
}: {
  ref: React.Ref<HTMLDivElement> | null;
  sendMessageAttr: () => SendMessageProps;
  participant: UserModel | undefined;
}) {
  const { t } = useTranslation();

  {
    /* TODO: Load previous messages*/
  }

  {
    /* IDEA: Create a shared component for showing the previous message history which can be used both in the modal and in the user profile */
  }

  return (
    <div className="modal" tabIndex={-1} role="dialog" ref={ref}>
      <div className="modal-dialog modal-sm" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">
              <i className="fa-solid fa-paper-plane fa-fw" />
              &nbsp;
              {t("participantContactModal.writeMessageTo", "Write a message to {USER}", {
                USER: participant?.getDisplayName(),
              })}
            </h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label={t("_button.close")}
            ></button>
          </div>
          <div className="modal-body">
            <SendMessage {...sendMessageAttr()} />
          </div>
        </div>
      </div>
    </div>
  );
}
