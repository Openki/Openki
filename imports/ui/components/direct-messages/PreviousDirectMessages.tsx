import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import type { DirectMessage } from "/imports/api/emails/publications";
import { cx } from "/imports/utils/cx";
import { useSession } from "/imports/utils/react-meteor-data";
import { useDetails as useEventDetails } from "/imports/api/events/publications";
import { useDetails as useGroupDetails } from "/imports/api/groups/publications";

const DEFAULT_VISIBLE_MESSAGES = 2;

export function PreviousDirectMessages({
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
  const { t } = useTranslation();

  const currentUserId = Meteor.userId();
  const currentYear = new Date().getFullYear();
  const locale = useSession("locale");

  return (
    Boolean(currentUserId) &&
    Boolean(visibleMessages.length) && (
      <div className="mb-4">
        <h4>{t("previousDirectMessages.title", "Previous messages:")}</h4>
        {previousMessages.length > visibleMessages.length && (
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span>
              {t("previousDirectMessages.showing", "Showing")} {visibleMessages.length} /{" "}
              {previousMessages.length}
            </span>
            <button onClick={() => setShowAll(true)} className="btn btn-secondary btn-sm">
              {t("previousDirectMessages.showAll", "Show all")}
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
  const [isLoading, group] = useGroupDetails(groupId);
  const url = !isLoading() && group && Router.url("showGroup", group);
  const label = url && group.name;
  const { t } = useTranslation();

  return (
    url &&
    label && (
      <span className="small">
        {t("previousDirectMessages.messageContext.sentVia", "Via")} <a href={url}>{label}</a>
      </span>
    )
  );
}

function EventMessageContext({ eventId }: { eventId: string }) {
  const [isLoading, event] = useEventDetails(eventId);
  const url = !isLoading() && event && Router.url("showEvent", event);
  const label = url && event.title;
  const { t } = useTranslation();

  return (
    url &&
    label && (
      <span className="small">
        {t("previousDirectMessages.messageContext.sentVia", "Via")} <a href={url}>{label}</a>
      </span>
    )
  );
}
