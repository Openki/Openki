import React, { useRef, useState } from "react";

import { type GroupRole, type GroupModel } from "/imports/api/groups/groups";
import { sendGroupChatMessage } from "/imports/api/group-chat-messages/methods";
import { Button } from "../../Buttons";
import { AutoGrowTextArea } from "../../form-control/AutoGrowTextArea";

interface Props {
  group: GroupModel;
  roleId: GroupRole["id"];
}

export function GroupRoleChat({ group, roleId }: Props) {
  // TODO: Load translations for the role

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

  return (
    <>
      <h2>
        Group {group.name} role chat for {roleId}
      </h2>

      <AutoGrowTextArea ref={messageInputRef} className="w-100" />

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
