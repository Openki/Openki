import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';

import { CourseModel } from '/imports/api/courses/courses';
import * as CourseMethods from '/imports/api/courses/methods';
import * as Alert from '/imports/api/alerts/alert';

import '/imports/ui/components/editable-image';
import type { UploadImage, Data as EditableImageData } from '/imports/ui/components/editable-image';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'courseImage', { course: CourseModel }>;

const template = Template.courseImage;

template.helpers({
	imageUploadArgs(): EditableImageData {
		const instance = Template.instance();
		return {
			thumbnail: instance.data.course?.publicImageUrl?.(),
			maxSize: 100,
			async onUpload(file: UploadImage) {
				const courseId = instance.data.course._id;
				try {
					await CourseMethods.updateImage(courseId, file);
					Alert.success(i18n('course.edit.image.updated', 'Image have been saved.'));
				} catch (err) {
					Alert.serverError(err, 'Could not save image.');
				}
			},
			async onDelete() {
				const courseId = instance.data.course._id;
				try {
					await CourseMethods.deleteImage(courseId);
					Alert.success(i18n('course.edit.image.removed', 'Image have been removed.'));
				} catch (err) {
					Alert.serverError(err, 'Could not remove image.');
				}
			},
		};
	},
});
