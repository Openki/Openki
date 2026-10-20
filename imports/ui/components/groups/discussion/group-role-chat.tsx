import React, { useRef, useState } from "react";

import { type GroupRole, type GroupModel } from "/imports/api/groups/groups";
import { sendGroupChatMessage } from "/imports/api/group-chat-messages/methods";
import { Button } from "../../Buttons";
import { AutoGrowTextArea } from "../../form-control/AutoGrowTextArea";
import { useGroupChatMessages } from "/imports/api/group-chat-messages/publications";
import { useEventListener } from "/imports/ui/hooks/useEventListener";
import { GroupChatMessage } from "./group-chat-message";

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
      {/* IDEA: Show some info about the group role chat to explain how it works, who can access it etc */}
      <h2>
        Group {group.name} role chat for {roleId}
      </h2>

      {/* TODO: Make the chat scrollable */}
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
      <AutoGrowTextArea
        ref={messageInputRef}
        className="w-100"
        placeholder="Message"
        // oxlint-disable jsx-a11y/no-autofocus
        autoFocus={true}
      />

      {/* TODO: Make the send button an inline icon button with a label */}
      <Button
        className="btn-primary d-block"
        onClick={sendMessage}
        disabled={isSubmitting}
        id="send-group-chat-message"
      >
        Send message
      </Button>
    </>
  );
}
