import React from "react";
import { useTranslation } from "react-i18next";

export function ButtonCourseArchive(){

  return  <button type="submit" className="btn {{buttonClass}} js-course-archive" {{disabledIfBusy}}>
    {{#if busy 'archive'}}
      <span class="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
      {{i18n 'course.archive.archiveButton.archiving' 'Archiving…'}}
    {{else}}
      {{textIdle}}
    {{/if}}
  </button>
}
