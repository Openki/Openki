import React, { useEffect, useRef, useState } from "react";

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

const messageSequenceTimeLimit = 1000 * 60 * 15; // 15 min

// TODO: Test with group with chat history: http://localhost:3000/group/5dbf3bec62/elektronik#discussion
// TODO: Test with group with no chat history: http://localhost:3000/group/c294d35055/deutschkurs
export function GroupRoleChat({ group, roleId }: Props) {
  // TODO: Add translation strings

  const [isLoading, messages] = useGroupChatMessages(group._id, roleId);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const role = group.roles.find((groupRole) => groupRole.id === roleId);
  if (!role) {
    throw new Error(`Expected role to exist in group: ${roleId}`);
  }
  const chatParticipants = group.getGroupChatParticipants(role);

  async function sendMessage() {
    // Don't allow sending messages if no other participants in the chat
    if (!hasOtherParticipants) {
      return;
    }
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
        // Show your new message
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  const [hasScrolled, setHasScrolled] = useState(false);
  const hasOtherParticipants = chatParticipants.length >= 2;

  // Allow sending messages with a keyboard shortcut
  useEventListener(document, "keydown", async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      await sendMessage();
    }
  });

  useEffect(() => {
    if (!hasScrolled && !isLoading() && messagesContainerRef.current) {
      // Scroll to the bottom only when first rendering the messages
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setHasScrolled(true);
    }
  }, [hasScrolled, isLoading]);

  return (
    <div className="max-h-75vh">
      {hasOtherParticipants && (
        <header className="small p-2 border-bottom bg-success border-secondary">
          <details>
            <summary className="d-flex justify-content-between align-items-center">
              <span>Group chat with you and {chatParticipants.length - 1} others.</span>
              <span className="btn btn-sm btn-light">Show participants</span>
            </summary>

            <ul className="m-0">
              {chatParticipants.map((participant) => (
                <li key={participant.user}>
                  <ProfileLink userId={participant.user} />
                </li>
              ))}
            </ul>
          </details>
        </header>
      )}

      {!isLoading() && (
        <div
          className="p-2 max-h-50vh overflow-y-auto overflow-anchor-none"
          ref={messagesContainerRef}
        >
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
          {/*
            Preserve scroll position when messages are re-rendered due to a data change.
            The height: 1 is important to make it work.
            Learn more: https://css-tricks.com/books/greatest-css-tricks/pin-scrolling-to-bottom/
          */}
          {/*
            NOTE: The `overflow-anchor` CSS property is baseline newly available in September 2026,
            but it's only Safari that has weak support right now.

            We might need a better solution for iOS devices.
            Or just wait for more Apple devices to update to Safari 27.

            Check browser support: https://caniuse.com/mdn-css_properties_overflow-anchor
          */}
          <div className="overflow-anchor-auto" style={{ height: 1 }}></div>
        </div>
      )}

      {/* TODO: Virtualize the message list to only render the items currently in view */}
      {/* IDEA: Show a button to scroll to the most recent message if the latest messages are not visible */}

      <div className="d-flex gap-2 p-2">
        <AutoGrowTextArea
          ref={messageInputRef}
          className="form-control flex-fill pt-2"
          placeholder="Message"
          // oxlint-disable jsx-a11y/no-autofocus
          autoFocus={true}
          disabled={!hasOtherParticipants}
        />

        <button
          className="btn btn-primary btn-sm justify-self-end align-self-end aspect-square rounded-circle"
          onClick={sendMessage}
          disabled={!hasOtherParticipants || isSubmitting}
          id="send-group-chat-message"
          aria-label={"Send message"}
          data-bs-title={"Send message"}
        >
          <span className="fa-solid fa-paper-plane cursor-pointer fa-xl fa-fw"></span>
        </button>
      </div>
    </div>
  );
}
