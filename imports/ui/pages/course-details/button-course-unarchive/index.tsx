import React from "react";
import { useTranslation } from "react-i18next";

export function ButtonCourseUnarchive(){
  return <button type="submit" className="btn btn-go js-course-unarchive" {{disabledIfBusy}}>
    {{#if busy 'unarchive'}}
      <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
      {{i18n 'course.archive.unarchiveButton.unarchiving' 'Unarchiving…'}}
    {{else}}
      {{i18n 'course.archive.unarchiveButton' 'Unarchive'}}
    {{/if}}
  </button>
}
