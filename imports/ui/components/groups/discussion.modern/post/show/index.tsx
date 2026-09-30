import React from "react";
import { useTranslation } from "react-i18next";

import { Groups } from "/imports/api/groups/groups";
import { GroupDiscussionEntity } from "/imports/api/group-discussions/group-discussions";
import * as GroupDiscussionsMethods from "/imports/api/group-discussions/methods";
import * as Alert from "/imports/api/alerts/alert";

import * as GroupDiscussionUtils from "/imports/utils/group-discussion-utils";
import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

import { DiscussionProfileIcon } from "../profile-icon";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { RemoveDropdown } from "./remove-dropdown";
import { UserName } from "/imports/ui/components/UserName";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { isNewPost, NewPost } from "../../new-post";

export interface Props {
  post: GroupDiscussionEntity | NewPost;
  onEdit: () => void;
}

export function Show({ post, onEdit }: Props) {
  const { dateFormat, fromNow } = useDateTimeFormat();
  const user = useUser();
  const { t } = useTranslation();

  function canEdit() {
    return GroupDiscussionUtils.canEditPost(user ?? undefined, post);
  }
  function canDelete() {
    const group = Groups.findOne(post.groupId);
    if (!group) {
      throw new Error("Unexpected falsy: group");
    }
    return GroupDiscussionUtils.canDeletePost(user ?? undefined, group, post);
  }
  const hasBeenEdited =
    !isNewPost(post) && post.time_updated.getTime() > post.time_created.getTime();
  async function handleRemove(post: GroupDiscussionEntity) {
    try {
      routerAutoscroll.cancelNext();

      await GroupDiscussionsMethods.deleteComment(post._id);
    } catch (err) {
      Alert.serverError(err, t("discussionPost.deleted.error", "Could not delete comment"));
    }
  }

  return isNewPost(post) ? (
    post.parentId ? (
      <div className="list-group-item ps-5">
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          {t("group.discussion.comment_answer", "Answer")}
        </button>
      </div>
    ) : (
      <button type="button" className="btn btn-secondary mb-3" onClick={onEdit}>
        {t("group.discussion.write_comment", "Write a comment")}
      </button>
    )
  ) : (
    <div className={cx("list-group-item d-flex align-items-start gap-3", post.parentId && "ps-5")}>
      <DiscussionProfileIcon userId={post.userId} />
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between">
          <p>
            {post.userId ? (
              <UserName userId={post.userId} />
            ) : (
              t("discussion.anonymous", "Anonymous")
            )}{" "}
            <span data-bs-title={dateFormat(post.time_created)}>{fromNow(post.time_created)}</span>
            {!!post.notifyAll && (
              <>
                {" "}
                <i
                  className="fa-solid fa-bell"
                  data-bs-title={
                    !post.eventId
                      ? t("group.discussion.allNotified", "All interested notified")
                      : t(
                          "event.discussion.allNotified",
                          "All interested and participants notified",
                        )
                  }
                />
              </>
            )}
            {hasBeenEdited && (
              <>
                {" "}
                - {t("group.discussion.lastUpdate", "Last update")}:{" "}
                <span data-bs-title={dateFormat(post.time_updated)}>
                  {fromNow(post.time_updated)}
                </span>
              </>
            )}
          </p>
          <span>
            {canEdit() && (
              <button type="button" className="discussion-edit-btn" onClick={onEdit}>
                <i className="fa-solid fa-pen-to-square" />
              </button>
            )}
            {!isNewPost(post) && canDelete() && (
              <RemoveDropdown onRemove={() => handleRemove(post)} />
            )}
          </span>
        </div>
        {!!post.title && <h4>{post.title}</h4>}
        <p dangerouslySetInnerHTML={{ __html: post.text }}></p>
      </div>
    </div>
  );
}
