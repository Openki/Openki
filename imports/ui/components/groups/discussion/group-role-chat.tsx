import React, { useRef, useState } from "react";

import { type GroupRole, type GroupModel } from "/imports/api/groups/groups";
import { sendGroupChatMessage } from "/imports/api/group-chat-messages/methods";
import { AutoGrowTextArea } from "../../form-control/AutoGrowTextArea";
import { useGroupChatMessages } from "/imports/api/group-chat-messages/publications";
import { useEventListener } from "/imports/ui/hooks/useEventListener";
import { GroupChatMessage } from "./group-chat-message";
import { ProfileLink } from "../../profile-link";

interface Props {
  group: GroupModel;
  roleId: GroupRole["id"];
}

const messageSequenceTimeLimit = 1000 * 60 * 30; // 30 min

// TODO: Test with group: http://localhost:3000/group/5dbf3bec62/elektronik#discussion
export function GroupRoleChat({ group, roleId }: Props) {
  // TODO: Load translations for the group roles
  // TODO: Add translation strings

  const [isLoading, messages] = useGroupChatMessages(group._id, roleId);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const role = group.roles.find((groupRole) => groupRole.id === roleId);
  if (!role) {
    throw new Error(`Expected role to exist in group: ${roleId}`);
  }
  const chatParticipants = group.getGroupChatParticipants(role);

  async function sendMessage() {
    const element = messageInputRef.current;
    const content = element?.value;

    if (!element || !content) {
      // Abort if message input not resolved, or the message has no content.
      return;
    }
    setIsSubmitting(true);
    await sendGroupChatMessage({ content, groupId: group._id, roleId })
      .then(() => {
        // Clear input after successfully sending the message
        element.value = "";
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  // Allow sending messages with a keyboard shortcut
  useEventListener(document, "keydown", async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      await sendMessage();
    }
  });

  return (
    <>
      <header className="small p-2 bg-secondary">
        <details>
          <summary className="d-flex justify-content-between align-items-center">
            <span>Group chat with you and {chatParticipants.length - 1} others.</span>
            <span className="btn btn-sm btn-light">Show participants</span>
          </summary>

          <ul>
            {chatParticipants.map((participant) => (
              <li key={participant.user}>
                <ProfileLink userId={participant.user} />
              </li>
            ))}
          </ul>
        </details>
      </header>

      {/* TODO: Add a max height to the chat and make it scrollable */}
      {!isLoading() && (
        <div className="p-2">
          {messages.map((message, i) => {
            const previousMessage = messages.at(i - 1);
            const nextMessage = messages.at(i + 1);
            // A sequence of messages are sent by the same user, and within a short time.
            const isFirstInSequence =
              previousMessage?.userId !== message.userId ||
              Math.abs(previousMessage.createdAt.getTime() - message.createdAt.getTime()) >
                messageSequenceTimeLimit;
            const isLastInSequence =
              nextMessage?.userId !== message.userId ||
              Math.abs(nextMessage.createdAt.getTime() - message.createdAt.getTime()) >
                messageSequenceTimeLimit;
            return (
              <GroupChatMessage
                message={message}
                key={message._id}
                isFirstInSequence={isFirstInSequence}
                isLastInSequence={isLastInSequence}
              />
            );
          })}
        </div>
      )}

      {/* TODO: Scroll to bottom of the messages on initial render */}
      {/* TODO: Virtualize the message list to only render the items currently in view */}
      {/* IDEA: Show a button to scroll to the most recent message if the latest messages are not visible */}

      {/* TODO: Align the input to the bottom of the tab. Position absolute with scroll padding bottom on the message history */}
      <div className="d-flex gap-2 p-2">
        <AutoGrowTextArea
          ref={messageInputRef}
          className="form-control flex-fill pt-2"
          placeholder="Message"
          // oxlint-disable jsx-a11y/no-autofocus
          autoFocus={true}
        />

        <button
          className="btn btn-primary btn-sm justify-self-end align-self-end aspect-square rounded-circle"
          onClick={sendMessage}
          disabled={isSubmitting}
          id="send-group-chat-message"
          aria-label={"Send message"}
          data-bs-title={"Send message"}
        >
          <span className="fa-solid fa-paper-plane cursor-pointer fa-xl fa-fw"></span>
        </button>
      </div>
    </>
  );
}
