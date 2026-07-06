import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "/imports/startup/client/bootstrap";
import { useUserId } from "/imports/utils/react-meteor-data";

import { GroupModel } from "/imports/api/groups/groups";
import * as emailMethods from "/imports/api/emails/methods";
import { SendPrivateMessageOptions } from "/imports/api/emails/methods";
import { EventModel } from "/imports/api/events/events";
import * as Users from "/imports/api/users/publications";

import { SendMessage, Props as SendMessageProps } from "../../SendMessage";

export interface Props {
  participant: string;
  group?: GroupModel;
  event?: EventModel;
}

export function ParticipantContact(props: Props) {
  const modalRef = useRef(null);
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const userId = useUserId();
  const [isLoading, participant] = Users.useDetails(props.participant);

  useEffect(() => {
    const element = modalRef.current as unknown as Element;
    if (!showModal || !element) {
      return;
    }
    Modal.getOrCreateInstance(element).show();
    element.addEventListener("hidden.bs.modal", () => {
      setShowModal(false);
    });
  });

  function showParticipantContact() {
    if (!userId) {
      return false;
    }

    return userId !== props.participant;
  }

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
        const element = modalRef.current as unknown as Element;
        Modal.getOrCreateInstance(element).hide();
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
                <button
                  className="btn btn-link p-0"
                  type="button"
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  <i
                    className="fa-solid fa-envelope fa-fw"
                    data-bs-title={t("user.privateMessage", "Contact directly")}
                  />
                </button>
              ) : (
                <button className="btn btn-link p-0 disabled" type="button" disabled>
                  <i
                    className="fa-solid fa-envelope fa-fw"
                    title={t(
                      "user.acceptsPrivateMessages.false",
                      "User does not accept direct messages from users",
                    )}
                  />
                </button>
              ))}
          </div>
          {showModal && (
            <div className="modal" tabIndex={-1} role="dialog" ref={modalRef}>
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
          )}
        </>
      )}
    </>
  );
}
