import React from "react";
import { useTracker } from "meteor/react-meteor-data";

import { getUserName } from "/imports/ui/lib/getUserName";
import { GroupChatMessageEntity } from "/imports/api/group-chat-messages/group-chat-messages";

interface Props {
  message: GroupChatMessageEntity;
}

export function GroupChatMessage({ message }: Props) {
  const userName = useTracker(() => getUserName(message.userId));
  return (
    <div>
      {userName}: {message.content}
    </div>
  );
}
