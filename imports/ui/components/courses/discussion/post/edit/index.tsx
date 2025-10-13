import React, { useEffect, useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseDiscussionEntity } from "/imports/api/course-discussions/course-discussions";
import * as CourseDiscussionsMethods from "/imports/api/course-discussions/methods";
import { EditCommentFields, PostCommentFields } from "/imports/api/course-discussions/methods";
import * as Alert from "/imports/api/alerts/alert";
import * as Courses from "/imports/api/courses/publications";

import { DiscussionProfileIcon } from "../profile-icon";
import { DiscussionProfileLink } from "../profile-link";
import { Richtext } from "/imports/ui/components/richtext";
import { ButtonCancel } from "../../../../Buttons";

export interface Props {
  post: CourseDiscussionEntity & { new?: true };
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

  const [isLoading, course] = Courses.useDetails(post.courseId);

  function notifyAllChecked() {
    if (!post.new) {
      return false;
    }
    if (post.notifyAll) {
      return true;
    }
    return false;
  }
  const [notifyAll, setNotifyAll] = useState(notifyAllChecked());
  // Update notifyAll on prop change
  useEffect(() => {
    setNotifyAll(!!post.notifyAll);
  }, [post.notifyAll]);

  const richtextPlaceholder = () => {
    return post.parentId
      ? t("course.discussion.text_placeholder_answer", "Your answer")
      : t("course.discussion.text_placeholder", "Your comment");
  };

  function postClass() {
    return post.parentId ? "discussion-comment" : "discussion-post";
  }
  function showUserId() {
    return !post.new || !anon;
  }

  function anonDisabled() {
    if (user?._id) {
      return {};
    }
    return { disabled: true };
  }
  function hasBeenEdited() {
    return moment(post.time_updated).isAfter(post.time_created);
  }
  function canNotifyAll() {
    if (anon) {
      return false;
    }

    if (user?.privileged("admin")) {
      return true;
    }

    if (isLoading()) {
      return false;
    }

    return !!(
      course?.userHasRole(user?._id, "team") ||
      user?.groups.some((g) => course?.groupOrganizers.includes(g))
    );
  }
  function richtextAttr() {
    return {
      text: post.text,
      placeholder: richtextPlaceholder(),
      onChange(value: string) {
        setValidComment(!!value);
        setCommentText(value);
      },
    };
  }

  return (
    <div className={`${postClass()} ${post.new && !post.parentId ? "discussion-post-new" : ""}`}>
      <DiscussionProfileIcon userId={post.userId} />
      <div className="discussion-edit-content">
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            setIsBusy(true);

            const comment = { title: commentTitle || "" } as PostCommentFields | EditCommentFields;

            comment.text = commentText;

            try {
              if (post.new) {
                const postComment = comment as PostCommentFields;
                postComment.courseId = post.courseId;
                if (post.eventId) {
                  postComment.eventId = post.eventId;
                }
                if (post.parentId) {
                  postComment.parentId = post.parentId;
                }

                postComment.anon = anon;
                postComment.notifyAll = notifyAll;

                await CourseDiscussionsMethods.postComment(postComment);
              } else {
                const editComment = comment as EditCommentFields;
                editComment._id = post._id;
                await CourseDiscussionsMethods.editComment(editComment);
              }

              onSave();
            } catch (err) {
              Alert.serverError(
                err,
                t("courseDiscussions.postComment.error", "Posting your comment went wrong"),
              );
            } finally {
              setIsBusy(false);
            }
          }}
        >
          <div className="discussion-edit-header">
            {showUserId() ? (
              <DiscussionProfileLink userId={post.userId} />
            ) : (
              <strong>{t("discussion.anonymous", "Anonymous")}</strong>
            )}
            {!post.new && (
              <span className="discussion-post-header-sub">
                {" "}
                <span data-bs-title={dateFormat(post.time_created)}>
                  {fromNow(post.time_created)}
                </span>
                {!!post.notifyAll && (
                  <>
                    {" "}
                    <i
                      className="fa-solid fa-bell"
                      aria-hidden="true"
                      data-bs-title={
                        !post.eventId
                          ? t("course.discussion.allNotified", "All interested notified")
                          : t(
                              "event.discussion.allNotified",
                              "All interested and participants notified",
                            )
                      }
                    ></i>
                  </>
                )}
                {hasBeenEdited() && (
                  <>
                    {" "}
                    - {t("course.discussion.lastUpdate", "Last update")}:{" "}
                    <span data-bs-title={dateFormat(post.time_updated)}>
                      {fromNow(post.time_updated)}
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
          <div className="discussion-edit-body">
            <div className="mb-3">
              <input
                className="form-control form-control-lg"
                type="text"
                placeholder={`${t("course.discussion.title_placeholder", "Title")} ${t(
                  "_inputField.optional",
                )}`}
                value={commentTitle}
                onChange={(event) => {
                  setCommentTitle(event.currentTarget.value);
                }}
                autoFocus={true}
              />
            </div>
            <div className="mb-3">
              <Richtext {...richtextAttr()} />
            </div>
            {!!post.new && (
              <>
                {canNotifyAll() && (
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={notifyAll}
                      id="canNotifyAllCheck"
                      onChange={(event) => {
                        setNotifyAll(event.currentTarget.checked);
                      }}
                    />
                    <label className="form-check-label" htmlFor="canNotifyAllCheck">
                      <i className="fa-solid fa-bell" aria-hidden="true"></i>&nbsp;
                      {t("course.discussion.notifyAll", "Notify all")}
                    </label>
                  </div>
                )}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={anon}
                    {...anonDisabled()}
                    id="anonymousCheck"
                    onChange={(event) => {
                      setAnon(event.currentTarget.checked);
                    }}
                  />
                  <label
                    className="form-check-label discussion-toggle-anonymous"
                    htmlFor="anonymousCheck"
                  >
                    <i className="fa-solid fa-user-secret" aria-hidden="true"></i>&nbsp;
                    {t("course.discussion.anon", "Anonymous comment")}
                  </label>
                </div>
              </>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-save discussion-save-btn"
                disabled={!validComment || isBusy}
              >
                <span className="fa-solid fa-paper-plane fa-fw" aria-hidden="true"></span>{" "}
                {post.new
                  ? post.parentId
                    ? t("course.discussion.comment_btn.answer", "Answer")
                    : t("course.discussion.comment_btn.write", "Write")
                  : t("course.discussion.comment_btn.update", "Update my comment")}
              </button>
              <ButtonCancel
                onClick={() => {
                  onCancel();
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
