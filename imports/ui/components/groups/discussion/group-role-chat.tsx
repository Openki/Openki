import React, { useRef, useState } from "react";

import { type GroupRole, type GroupModel } from "/imports/api/groups/groups";
import { sendGroupChatMessage } from "/imports/api/group-chat-messages/methods";
import { Button } from "../../Buttons";
import { AutoGrowTextArea } from "../../form-control/AutoGrowTextArea";
import { useGroupChatMessages } from "/imports/api/group-chat-messages/publications";
import { GroupChatMessageEntity } from "/imports/api/group-chat-messages/group-chat-messages";
import { useTracker } from "meteor/react-meteor-data";
import { getUserName } from "/imports/ui/lib/getUserName";
import { useEventListener } from "/imports/ui/hooks/useEventListener";

interface Props {
  group: GroupModel;
  roleId: GroupRole["id"];
}

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
            <GroupChatMessage message={message} key={message._id} />
          ))}
        </div>
      )}

      <AutoGrowTextArea ref={messageInputRef} className="w-100" placeholder="Message" />

      {/* TODO: Align the input to the bottom of the tab. Position absolute with scroll padding bottom on the message history */}
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

interface GroupChatMessageProps {
  message: GroupChatMessageEntity;
}
function GroupChatMessage({ message }: GroupChatMessageProps) {
  const userName = useTracker(() => getUserName(message.userId));
  return (
    <div>
      {userName}: {message.content}
    </div>
  );
}
