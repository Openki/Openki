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
        <div>
          {messages.map((message) => (
            // TODO: Split messages into sequences, grouping messages by the same user together.
            // If any message is more than 15 minutes later than the previous, or by another user, then split the sequence.
            // TODO: Only show sender name for the first message in a sequence of messages by the same user
            // TODO: Only show the timestamp for the last message in a sequence of messages by the same user.
            // TODO: Add different spacing between each sequence of messages
            <GroupChatMessage message={message} key={message._id} />
          ))}
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
