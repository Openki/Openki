import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "/imports/startup/client/bootstrap";
import { useSession, useUser } from "/imports/utils/react-meteor-data";
import { useDirectMessagesWithUser, type DirectMessage } from "/imports/api/emails/publications";

import { GroupModel } from "/imports/api/groups/groups";
import * as emailMethods from "/imports/api/emails/methods";
import { SendPrivateMessageOptions } from "/imports/api/emails/methods";
import { EventModel } from "/imports/api/events/events";
import * as Users from "/imports/api/users/publications";

import { SendMessage, Props as SendMessageProps } from "../../SendMessage";
import { type UserModel } from "/imports/api/users/users";
import { cx } from "/imports/utils/cx";
import { Router } from "meteor/iron:router";
import { useDetails as useEventDetails } from "/imports/api/events/publications";
import { useDetails as useGroupDetails } from "/imports/api/groups/publications";

export interface Props {
  participant: string;
  group?: GroupModel;
  event?: EventModel;
}

export function ParticipantContact(props: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const user = useUser();
  // TODO: Temporary for development
  const [showModal, setShowModal] = useState(true);
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

  function sendMessageAttr(): Omit<SendMessageProps, "showEmailOptions"> {
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
      recipientId: props.participant,
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
  ref?: React.RefObject<HTMLDivElement | null>;
  sendMessageAttr: () => Omit<SendMessageProps, "showEmailOptions">;
  participant: UserModel;
}) {
  const { t } = useTranslation();
  const [isLoadingMessages, previousMessages] = useDirectMessagesWithUser(participant._id);
  const showEmailOptions = !isLoadingMessages() && previousMessages.length === 0;

  return (
    <div className="modal" tabIndex={-1} role="dialog" ref={ref}>
      <div className="modal-dialog modal-sm" role="document">
        <div className="modal-content">
          {/* Use a z-index that is higher than the values defined by https://getbootstrap.com/docs/5.3/layout/z-index/ */}
          <div className="modal-header position-sticky top-0" style={{ zIndex: 1200 }}>
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
            <PreviousDirectMessages
              previousMessages={previousMessages}
              onContextLinkClick={() => {
                if (!ref?.current) {
                  return;
                }
                // Close the modal before navigating to another page
                Modal.getOrCreateInstance(ref.current).hide();
              }}
            />
            <SendMessage {...sendMessageAttr()} showEmailOptions={showEmailOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_VISIBLE_MESSAGES = 2;

// TODO: Add translation keys
function PreviousDirectMessages({
  previousMessages,
  onContextLinkClick,
}: {
  previousMessages: DirectMessage[];
  onContextLinkClick?: () => void;
}) {
  // TODO: Change this back after testing
  const [showAll, setShowAll] = useState(true);
  const visibleMessages = (
    showAll ? previousMessages : previousMessages.slice(-DEFAULT_VISIBLE_MESSAGES)
  ) as DirectMessage[];

  const currentUserId = Meteor.userId();
  const currentYear = new Date().getFullYear();
  const locale = useSession("locale");

  return (
    Boolean(currentUserId) &&
    Boolean(visibleMessages.length) && (
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
          {visibleMessages.map(({ _id, ts, body }) => {
            const wasSentByCurrentUser = body.sender === currentUserId;
            return (
              <div
                key={_id}
                className={cx(
                  "d-flex flex-column gap-1",
                  wasSentByCurrentUser ? "align-items-end" : "align-items-start",
                )}
              >
                <MessageContext context={body.context} onContextLinkClick={onContextLinkClick} />
                <section
                  className={cx(
                    "py-2 px-3 max-w-75 rounded-3",
                    wasSentByCurrentUser ? "bg-primary-subtle" : "bg-secondary",
                  )}
                >
                  <div className="whitespace-pre-line">{body.message}</div>

                  <time
                    dateTime={ts.toISOString()}
                    className={cx(
                      "small pt-2 fst-italic w-100 d-block",
                      wasSentByCurrentUser ? "text-end" : "text-start",
                    )}
                  >
                    {ts.toLocaleString(locale, {
                      day: "numeric",
                      month: "long",
                      year: ts.getFullYear() !== currentYear ? "numeric" : undefined,
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </time>
                </section>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}

function MessageContext({
  context,
  onContextLinkClick,
}: {
  context?: { group?: string; event?: string } | undefined;
  onContextLinkClick?: (() => void) | undefined;
}) {
  if (!context) {
    return null;
  }

  return (
    <div
      onClickCapture={(event) => {
        if ((event.target as HTMLElement).tagName !== "A") {
          return;
        }
        onContextLinkClick?.();
      }}
    >
      {context.group ? (
        <GroupMessageContext groupId={context.group} />
      ) : context.event ? (
        <EventMessageContext eventId={context.event} />
      ) : null}
    </div>
  );
}

function GroupMessageContext({ groupId }: { groupId: string }) {
  // eslint-disable-next-line
  const [isLoading, group] = useGroupDetails(groupId!);
  const url = !isLoading() && group && Router.url("showGroup", group);
  const label = url && group.name;

  return (
    url &&
    label && (
      <span className="small">
        Via <a href={url}>{label}</a>
      </span>
    )
  );
}

function EventMessageContext({ eventId }: { eventId: string }) {
  // eslint-disable-next-line
  const [isLoading, event] = useEventDetails(eventId!);
  const url = !isLoading() && event && Router.url("showEvent", event);
  const label = url && event.title;

  return (
    url &&
    label && (
      <span className="small">
        Via <a href={url}>{label}</a>
      </span>
    )
  );
}
