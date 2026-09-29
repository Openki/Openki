import React, { useEffect, useRef, useState } from "react";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

import { GroupDiscussionEntity } from "/imports/api/group-discussions/group-discussions";

import { Edit, type Props as GroupDiscussionEditProps } from "./edit";
import { Show } from "./show";

import "./styles.scss";

function Responses({ responses: replies }: { responses: GroupDiscussionEntity[] }) {
  const { t } = useTranslation();
  const [limit, setLimit] = useState(2);

  function responses() {
    return limit ? replies.slice(-limit) : replies;
  }
  function notAllResponsesShown() {
    return limit && replies.length > limit;
  }

  return (
    <>
      {!!notAllResponsesShown() && (
        <button
          className="mt-3 btn btn-link p-0 toggle-all-responses"
          type="button"
          onClick={() => {
            setLimit(0);
          }}
        >
          {t("group.discussions.showPreviousReplies", "Show all previous answers")}
        </button>
      )}
      {responses().map((response) => (
        <Post key={response._id} post={response} />
      ))}
    </>
  );
}

export interface Props {
  post: GroupDiscussionEntity & { new?: true };
  responses?: GroupDiscussionEntity[];
  edit?: boolean;
  onCancel?: () => void;
}

export function Post({ post, responses, edit, onCancel }: Props) {
  const isParent = !post.new && !post.parentId;
  const userId = useUserId();
  const [editing, setEditing] = useState(!!edit);
  const isFirstRender = useRef(true);
  // Update editing after prop change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setEditing(!!edit);
  }, [edit]);

  function getNewPost() {
    return {
      new: true,
      parentId: post._id,
      groupId: post.groupId,
      eventId: post.eventId,
      userId,
      title: "",
      text: "",
    } as GroupDiscussionEditProps["post"];
  }
  function postShowAttr() {
    return {
      post,
      onEdit: () => {
        setEditing(true);
      },
    };
  }
  function postEditAttr() {
    return {
      post,
      onSave: () => {
        setEditing(false);
      },
      onCancel: () => {
        setEditing(false);
        onCancel?.();
      },
    };
  }

  return (
    <>
      {editing ? <Edit {...postEditAttr()} /> : <Show {...postShowAttr()} />}

      {isParent && (
        <>
          {!!responses && <Responses responses={responses} />}
          <Post post={getNewPost()} />
        </>
      )}
    </>
  );
}
