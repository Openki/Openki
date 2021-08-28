import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import './template.html';
import './styles.scss';

// feature detection for drag&drop upload
const supportsDragndrop = (function () {
	const div = document.createElement('div');
	return 'draggable' in div || ('ondragstart' in div && 'ondrop' in div);
})();

const Template = TemplateAny as TemplateStaticTyped<
	{
		accept: string;
		action: string;
		onUploaded: () => void;
		onCancel: () => void;
		onError: () => void;
	},
	'fileUpload',
	{
		droppedFile: ReactiveVar<File | undefined>;
		state: ReactiveDict<{
			supportsDragndrop: boolean;
			progress: 'start' | 'ready' | 'uploading' | 'done' | 'error';
			dragover: boolean;
		}>;
	}
>;

const template = Template.fileUpload;

template.onCreated(function () {
	const instance = this;

	instance.droppedFile = new ReactiveVar(undefined);
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		supportsDragndrop,
		progress: 'start',
		dragover: false,
	});
});

template.helpers({
	fileName: () => {
		return Template.instance().droppedFile.get()?.name;
	},
});

template.events({
	'drag/dragstart/dragend/dragover/dragenter/dragleave/drop form'(event) {
		// preventing the unwanted behaviours
		event.preventDefault();
		event.stopPropagation();
	},

	'dragover/dragenter form'(_event, instance) {
		instance.state.set('dragover', true);
	},

	'dragleave/dragend/drop form'(_event, instance) {
		instance.state.set('dragover', false);
	},

	'change input[type="file"]'(event, instance) {
		instance.droppedFile.set((event.target as any).files[0]);

		instance.state.set('progress', 'ready');
	},

	'drop form'(event, instance) {
		instance.droppedFile.set(((event as any).originalEvent.dataTransfer as DataTransfer).files[0]);

		instance.state.set('progress', 'ready');
	},

	'click .js-file-upload-upload'(event, instance) {
		event.preventDefault();

		const file = instance.droppedFile.get();
		if (!file) {
			throw new Error(`Unexpected undefined: file`);
		}

		instance.state.set('progress', 'uploading');

		// gathering the form data
		const ajaxData = new FormData();
		ajaxData.append('file', file);

		// ajax request
		const ajax = new XMLHttpRequest();
		ajax.open('post', Template.currentData().action, true);

		ajax.onload = function () {
			if (ajax.status >= 200 && ajax.status < 400) {
				instance.state.set('progress', 'done');
				Template.currentData().onUploaded();
			} else {
				instance.state.set('progress', 'error');
				Template.currentData().onError();
			}
		};

		ajax.onerror = function () {
			instance.state.set('progress', 'error');
			Template.currentData().onError();
		};

		ajax.send(ajaxData);
	},

	'click .js-file-upload-cancel'(event) {
		event.preventDefault();
		Template.currentData().onCancel();
	},
});
