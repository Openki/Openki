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

export interface UploadFile {
	lastModified: Date;
	name: string;
	size: number;
	mimeType: string;
	/** As BinaryString */
	content: string;
}

export interface Data {
	accept: string;
	onUpload: (file: UploadFile) => void;
	onCancel: () => void;
}

const Template = TemplateAny as TemplateStaticTyped<
	'fileUpload',
	Data,
	{
		droppedFile: ReactiveVar<File | undefined>;
		state: ReactiveDict<{
			supportsDragndrop: boolean;
			progress: 'start' | 'ready' | 'uploading' | 'done';
			dragover: boolean;
		}>;
	}
>;

export const template = Template.fileUpload;

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

		const droppedFile = instance.droppedFile.get();
		if (!droppedFile) {
			throw new Error(`Unexpected undefined: file`);
		}

		instance.state.set('progress', 'uploading');

		const reader = new FileReader();

		reader.onload = () => {
			instance.data.onUpload({
				lastModified: new Date(droppedFile.lastModified),
				name: droppedFile.name,
				size: droppedFile.size,
				mimeType: droppedFile.type,
				content: reader.result as string,
			});
			instance.state.set('progress', 'done');
		};

		reader.readAsBinaryString(droppedFile);
	},

	'click .js-file-upload-cancel'(event) {
		event.preventDefault();
		Template.currentData().onCancel();
	},
});
