import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "/imports/startup/client/bootstrap";
import { useUser } from "/imports/utils/react-meteor-data";
import { useDirectMessagesWithUser } from "/imports/api/emails/publications";

import { GroupModel } from "/imports/api/groups/groups";
import * as emailMethods from "/imports/api/emails/methods";
import { SendPrivateMessageOptions } from "/imports/api/emails/methods";
import { EventModel } from "/imports/api/events/events";
import * as Users from "/imports/api/users/publications";

import { SendMessage, Props as SendMessageProps } from "../../SendMessage";
import { type UserModel } from "/imports/api/users/users";
import { LogEntity } from "/imports/api/log/factory";
import { cx } from "/imports/utils/cx";

export interface Props {
  participant: string;
  group?: GroupModel;
  event?: EventModel;
}

export function ParticipantContact(props: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  // TODO: Temporary during development
  const [showModal, setShowModal] = useState(true);
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
  const [isLoadingMessages, previousMessages] = useDirectMessagesWithUser(props.participant);
  const showEmailOptions = !isLoadingMessages() && previousMessages.length === 0;

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
      showEmailOptions,
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
          {showModal && participant && (
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
  participant: UserModel;
}) {
  const { t } = useTranslation();

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
            <PreviousDirectMessages otherUser={participant} />
            <SendMessage {...sendMessageAttr()} />
          </div>
        </div>
      </div>
    </div>
  );
}

type DirectMessage = Pick<LogEntity, "_id" | "ts"> & {
  // TODO: Handle other kinds of contexts
  // for example events
  body: { message: string; sender: string; targetRecipient: string; context?: { group?: string } };
};

const DEFAULT_VISIBLE_MESSAGES = 2;

// TODO: Add translation keys
function PreviousDirectMessages({ otherUser }: { otherUser: UserModel }) {
  // TODO: Improve type for returned messages
  const [isLoading, previousMessages] = useDirectMessagesWithUser(otherUser._id);
  // TODO: Change this back after testing
  const [showAll, setShowAll] = useState(true);
  const visibleMessages = (
    showAll ? previousMessages : previousMessages.slice(-DEFAULT_VISIBLE_MESSAGES)
  ) as DirectMessage[];

  const currentUserId = Meteor.userId();

  return (
    <div className="mb-4">
      <h4>Previous messages:</h4>
      {previousMessages.length > visibleMessages.length && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span>
            Showing {visibleMessages.length} / {previousMessages.length}
          </span>
          <button onClick={() => setShowAll(true)} className="btn btn-secondary btn-sm">
            Show all
          </button>
        </div>
      )}

      <div className="d-grid gap-3">
        {!isLoading() &&
          Boolean(currentUserId) &&
          visibleMessages.map(({ _id, ts, body }) => {
            const wasSentByCurrentUser = body.sender === currentUserId;
            return (
              <div key={_id} className="d-grid gap-1">
                <section
                  className={cx(
                    "py-2 px-3 max-w-75 rounded-3 whitespace-pre-line",
                    wasSentByCurrentUser
                      ? "justify-self-end bg-primary-subtle"
                      : "justify-self-start bg-secondary",
                  )}
                >
                  {body.message}
                </section>
                <time
                  dateTime={ts.toISOString()}
                  className={cx(
                    "small",
                    wasSentByCurrentUser ? "justify-self-end" : "justify-self-start",
                  )}
                >
                  {ts.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </time>
              </div>
            );
          })}
      </div>
    </div>
  );
}
