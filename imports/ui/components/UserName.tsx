import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { getUserName } from "/imports/ui/lib/getUserName";

export function UserName({ userId }: { userId: string }) {
  const userName = useTracker(() => getUserName(userId));
  return <>{userName}</>;
}
