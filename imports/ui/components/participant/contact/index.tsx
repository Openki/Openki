/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "bootstrap/js/dist/modal";
import { useUserId } from "/imports/utils/react-meteor-data";

import * as emailMethods from "/imports/api/emails/methods";
import { EventModel } from "/imports/api/events/events";
import { CourseModel } from "/imports/api/courses/courses";
import { SendPrivateMessageOptions } from "/imports/api/emails/methods";
import * as Users from "/imports/api/users/publications";

import { SendMessage, Data as SendMessageData } from "/imports/ui/components/send-message";

export interface Props {
  participant: string;
  course?: CourseModel;
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

  function sendMessageAttr(): SendMessageData {
    return {
      placeholder: t(
        "participantContact.sendMessage.placeholder",
        "Hi {USER}. I wanted to tell you…",
        { USER: participant?.getDisplayName() },
      ),
      onSend: async (message, options) => {
        const sendPrivateMessageOptions = options as SendPrivateMessageOptions;
        if (props.course) {
          sendPrivateMessageOptions.courseId = props.course?._id;
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
                  <i className="fa-solid fa-envelope fa-fw"></i>
                </button>
              ) : (
                <button className="btn btn-link p-0 disabled" type="button" disabled>
                  <i
                    className="fa-solid fa-envelope fa-fw"
                    title={t(
                      "user.acceptsPrivateMessages.false",
                      "User does not accept private messages from users",
                    )}
                  ></i>
                </button>
              ))}
          </div>
          {showModal && (
            <div className="modal" tabIndex={-1} role="dialog" ref={modalRef}>
              <div className="modal-dialog modal-sm" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title">
                      <span className="fa-solid fa-paper-plane fa-fw" aria-hidden="true"></span>
                      &nbsp;
                      {t("participantContactModal.writeMessageTo", "Write a message to {USER}", {
                        USER: participant?.getDisplayName(),
                      })}
                    </h4>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      data-bs-dismiss="modal"
                      aria-label="Close"
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
