import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

import { GroupDiscussionEntity } from "/imports/api/group-discussions/group-discussions";
import * as GroupDiscussionsMethods from "/imports/api/group-discussions/methods";
import { EditCommentFields, PostCommentFields } from "/imports/api/group-discussions/methods";
import * as Alert from "/imports/api/alerts/alert";
import * as Groups from "/imports/api/groups/publications";

import { DiscussionProfileIcon } from "../profile-icon";
import { Richtext } from "/imports/ui/components/richtext";
import { ButtonCancel } from "../../../../Buttons";
import { UserName } from "/imports/ui/components/UserName";
import { FormCheck } from "/imports/ui/components/FormCheck";

export interface Props {
  post: GroupDiscussionEntity & { new?: true };
  onSave: () => void;
  onCancel: () => void;
}

export function Edit({ post, onSave, onCancel }: Props) {
  const { dateFormat, fromNow } = useDateTimeFormat();
  const user = useUser();
  const { t } = useTranslation();
  const [anon, setAnon] = useState(!post.userId);
  const [validComment, setValidComment] = useState(!!post.text.trim());
  const [commentTitle, setCommentTitle] = useState(post.title);
  const [commentText, setCommentText] = useState(post.text);
  const [isBusy, setIsBusy] = useState(false);

  const [isLoading, group] = Groups.useDetails(post.groupId);

  function getNotifyAllDefaultValue() {
    if (!post.new) {
      return false;
    }
    if (post.notifyAll) {
      return true;
    }
    return false;
  }
  const [notifyAll, setNotifyAll] = useState(getNotifyAllDefaultValue());
  const isFirstRender = useRef(true);
  // Update notifyAll on prop change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setNotifyAll(Boolean(post.notifyAll));
  }, [post.notifyAll]);

  const richtextPlaceholder = post.parentId
    ? t("group.discussion.text_placeholder_answer", "Your answer")
    : t("group.discussion.text_placeholder", "Your comment");

  function showUserId() {
    return !post.new || !anon;
  }

  function anonDisabled() {
    if (user?._id) {
      return false;
    }
    return true;
  }
  const hasBeenEdited = post.time_updated.getTime() > post.time_created.getTime();
  function canNotifyAll() {
    if (anon) {
      return false;
    }

    if (user?.hasPrivilege("admin")) {
      return true;
    }

    if (isLoading()) {
      return false;
    }

    return !!(
      group?.userHasRole(user?._id, "team") ||
      user?.organizations.some((o) => group?.teamOrganizations.includes(o))
    );
  }
  function richtextAttr() {
    return {
      text: post.text,
      placeholder: richtextPlaceholder,
      onChange(value: string) {
        setValidComment(!!value);
        setCommentText(value);
      },
    };
  }

  return (
    <div className={cx("list-group-item d-flex align-items-start gap-3", post.parentId && "ps-5")}>
      <DiscussionProfileIcon userId={post.userId} />

      <form
        className="flex-grow-1"
        onSubmit={async (event) => {
          event.preventDefault();

          setIsBusy(true);

          const comment = { title: commentTitle || "" } as PostCommentFields | EditCommentFields;

          comment.text = commentText;

          try {
            if (post.new) {
              const postComment = comment as PostCommentFields;
              postComment.groupId = post.groupId;
              if (post.eventId) {
                postComment.eventId = post.eventId;
              }
              if (post.parentId) {
                postComment.parentId = post.parentId;
              }

              postComment.anon = anon;
              postComment.notifyAll = notifyAll;

              await GroupDiscussionsMethods.postComment(postComment);
            } else {
              const editComment = comment as EditCommentFields;
              editComment._id = post._id;
              await GroupDiscussionsMethods.editComment(editComment);
            }

            onSave();
          } catch (err) {
            Alert.serverError(
              err,
              t("groupDiscussions.postComment.error", "Posting your comment went wrong"),
            );
          } finally {
            setIsBusy(false);
          }
        }}
      >
        <div>
          {showUserId() && post.userId ? (
            <UserName userId={post.userId} />
          ) : (
            t("discussion.anonymous", "Anonymous")
          )}
          {!post.new && (
            <span>
              {" "}
              <span data-bs-title={dateFormat(post.time_created)}>
                {fromNow(post.time_created)}
              </span>
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
            </span>
          )}
        </div>
        <div>
          <div className="mb-3">
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder={`${t("group.discussion.title_placeholder", "Title")} ${t(
                "_inputField.optional",
              )}`}
              value={commentTitle}
              onChange={(event) => setCommentTitle(event.currentTarget.value)}
              autoFocus
            />
          </div>
          <div className="mb-2">
            <Richtext {...richtextAttr()} />
          </div>
          {!!post.new && (
            <>
              {canNotifyAll() && (
                <FormCheck
                  type="box"
                  id="discussion-post-edit-notify-all"
                  label={
                    <>
                      <i className="fa-solid fa-bell" />
                      &nbsp;
                      {t("group.discussion.notifyAll", "Notify all")}
                    </>
                  }
                  checked={notifyAll}
                  onChange={(checked) => setNotifyAll(checked)}
                />
              )}
              <FormCheck
                type="box"
                id="discussion-post-edit-anonymous"
                label={
                  <>
                    <i className="fa-solid fa-user-secret" />
                    &nbsp;
                    {t("group.discussion.anon", "Anonymous comment")}
                  </>
                }
                checked={anon}
                onChange={(checked) => setAnon(checked)}
                disabled={anonDisabled()}
              />
            </>
          )}

          <div>
            <button
              type="submit"
              className="btn btn-secondary discussion-save-btn"
              disabled={!validComment || isBusy}
            >
              <i className="fa-solid fa-paper-plane fa-fw" />{" "}
              {post.new
                ? post.parentId
                  ? t("group.discussion.comment_btn.answer", "Answer")
                  : t("group.discussion.comment_btn.write", "Write")
                : t("group.discussion.comment_btn.update", "Update my comment")}
            </button>{" "}
            <ButtonCancel id="post-edit-cancel" onClick={() => onCancel()} />
          </div>
        </div>
      </form>
    </div>
  );
}
