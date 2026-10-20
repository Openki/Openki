import React from "react";
import { useTracker } from "meteor/react-meteor-data";

import { getUserName } from "/imports/ui/lib/getUserName";
import { GroupChatMessageEntity } from "/imports/api/group-chat-messages/group-chat-messages";
import { cx } from "/imports/utils/cx";
import { useReactiveNow } from "/imports/utils/reactive-now";
import { useSession } from "/imports/ui/hooks/react-meteor-data";

interface Props {
  message: GroupChatMessageEntity;
}

export function GroupChatMessage({ message }: Props) {
  const senderUserName = useTracker(() => getUserName(message.userId));
  const currentUserId = Meteor.userId();
  const wasSentByCurrentUser = !!currentUserId && message.userId === currentUserId;
  const now = useReactiveNow();
  const locale = useSession("locale");

  return (
    <div
      key={message._id}
      className={cx(
        "d-flex flex-column gap-1",
        wasSentByCurrentUser ? "align-items-end" : "align-items-start",
      )}
    >
      <section
        className={cx(
          "py-2 px-3 max-w-75 rounded-3",
          wasSentByCurrentUser ? "bg-primary-subtle" : "bg-secondary",
        )}
      >
        {!wasSentByCurrentUser && <span className="fw-bold mb-2">{senderUserName}</span>}
        <div className="whitespace-pre-line text-dark">{message.content}</div>

        <time
          dateTime={message.createdAt.toISOString()}
          className="small pt-2 fst-italic w-100 d-block text-end"
        >
          {message.createdAt.toLocaleString(locale, {
            day: "numeric",
            month: "long",
            year: message.createdAt.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </time>
      </section>
    </div>
  );
}
