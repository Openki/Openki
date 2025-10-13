import React from "react";
import { useTranslation } from "react-i18next";


import "./styles.scss";


export function ConfirmDialog(){
  return <div className="course-delete-confirm">
    <p>{{i18n 'course.reallydelete' 'Please confirm that you would like to delete {COURSE}. This cannot be undone.' COURSE=course.name}}
    </p>
    <div className="form-actions">
      {{#unless hasArchiveButton}}
        {{> buttonCourseArchive 
					buttonClass="btn-warning"
					textIdle=(i18n 'course.delete.confirm.archiveButton' 'Rather archive')
				}}
      {{/unless}}
      {{> buttonDeleteConfirm
				event="js-delete-course-confirm"
				textIdle=(i18n 'course.delete.confirm.button' 'Delete {COURSE} and its events' COURSE=course.name)
				textBusy=(i18n '_button.deleting')
			}}
      {{> buttonCancel event="js-collapse"}}
    </div>
  </div>
}
