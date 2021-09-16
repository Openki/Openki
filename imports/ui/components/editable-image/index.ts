import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import ImageBlobReduce from 'image-blob-reduce';
import Pica from 'pica';

import './template.html';
import './styles.scss';

// feature detection for drag&drop upload
const supportsDragndrop = (function () {
	const div = document.createElement('div');
	return 'draggable' in div || ('ondragstart' in div && 'ondrop' in div);
})();

export interface UploadImage {
	lastModified: Date;
	name: string;
	size: number;
	mimeType: string;
	/** As BinaryString */
	content: string;
}

export interface Data {
	maxSize?: number;
	thumbnail?: string;
	onUpload: (file: UploadImage) => void;
}

const Template = TemplateAny as TemplateStaticTyped<
	Data,
	'editableImage',
	{
		droppedFile: ReactiveVar<UploadImage | undefined>;
		state: ReactiveDict<{
			supportsDragndrop: boolean;
			progress: 'display' | 'edit' | 'ready' | 'uploading';
			dragover: boolean;
			preview: string | undefined;
		}>;
		onDrop: (file: File) => void;
	}
>;

export const template = Template.editableImage;

template.onCreated(function () {
	const instance = this;

	instance.droppedFile = new ReactiveVar(undefined);
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		supportsDragndrop,
		progress: 'display',
		dragover: false,
		preview: undefined,
	});

	instance.onDrop = async (file: File) => {
		let rezisedFile;
		if (instance.data.maxSize) {
			try {
				rezisedFile = await new ImageBlobReduce().toBlob(file, { max: instance.data.maxSize });
			} catch (ex) {
				console.info("blocked "+ ex)
				try {
					rezisedFile = await new ImageBlobReduce(
						new Pica({ features: ['js', 'wasm', 'cib', 'ww'] }),
					).toBlob(file, { max: instance.data.maxSize });
				} catch (ex2) {
					console.info("s. blocked "+ ex2)
					rezisedFile = file;
				}
			}
		} else {
			rezisedFile = file;
		}

		{
			const reader = new FileReader();
			reader.onload = () => {
				instance.droppedFile.set({
					lastModified: new Date(file.lastModified),
					name: file.name,
					size: file.size,
					mimeType: file.type,
					content: reader.result as string,
				});

				instance.state.set('progress', 'ready');
			};
			reader.readAsBinaryString(rezisedFile);
		}

		{
			const reader = new FileReader();
			reader.onload = function () {
				instance.state.set('preview', reader.result as string);
			};
			reader.readAsDataURL(rezisedFile);
		}
	};
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

	async 'change input[type="file"]'(event, instance) {
		const file = (event.target as any).files[0];

		instance.onDrop(file);
	},

	async 'drop form'(event, instance) {
		const file = ((event as any).originalEvent.dataTransfer as DataTransfer).files[0];

		instance.onDrop(file);
	},

	'click .js-editable-image-edit'(event, instance) {
		event.preventDefault();

		instance.state.set('progress', 'edit');
	},

	'click .js-editable-image-upload'(event, instance) {
		event.preventDefault();

		const droppedFile = instance.droppedFile.get();
		if (!droppedFile) {
			throw new Error(`Unexpected undefined: file`);
		}

		instance.state.set('progress', 'uploading');

		instance.data.onUpload(droppedFile);

		instance.droppedFile.set(undefined);
		instance.state.set('preview', undefined);
		instance.state.set('progress', 'display');
	},

	'click .js-editable-image-cancel'(event, instance) {
		event.preventDefault();

		instance.droppedFile.set(undefined);
		instance.state.set('preview', undefined);
		instance.state.set('progress', 'display');
	},
});
