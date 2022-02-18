import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import ImageBlobReduce from 'image-blob-reduce';
import { i18n } from '/imports/startup/both/i18next';

import * as Alert from '/imports/api/alerts/alert';

import './template.html';
import './styles.scss';

// feature detection for drag&drop upload
const supportsDragndrop = (function () {
	const div = document.createElement('div');
	return 'draggable' in div || ('ondragstart' in div && 'ondrop' in div);
})();

function id() {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

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
	thumbnail?: { src?: string; maxSize?: number };
	onUpload: (file: UploadImage) => void;
	onDelete?: () => void;
}

const Template = TemplateAny as TemplateStaticTyped<
	'editableImage',
	Data,
	{
		id: string;
		droppedFile: ReactiveVar<UploadImage | undefined>;
		state: ReactiveDict<{
			supportsDragndrop: boolean;
			progress: 'display' | 'edit' | 'ready' | 'uploading';
			copyRights: false;
			dragover: boolean;
			preview: string | undefined;
		}>;
		onDrop: (file: File) => void;
		onUpload: () => void;
		onDelete: () => void;
		onCancel: () => void;
	}
>;

const template = Template.editableImage;

template.onCreated(function () {
	const instance = this;

	instance.id = id();

	instance.droppedFile = new ReactiveVar(undefined);
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		supportsDragndrop,
		progress: 'display',
		copyRights: false,
		dragover: false,
		preview: undefined,
	});

	instance.onDrop = async (file: File) => {
		if (!file.type.startsWith('image/')) {
			Alert.error(i18n('editableImage.accept.error', 'Only images are allowed.'));
			return;
		}

		let rezisedFile;
		if (instance.data.maxSize) {
			try {
				rezisedFile = await new ImageBlobReduce({
					pica: ImageBlobReduce.pica({ features: ['js', 'wasm'] }),
				}).toBlob(file, { max: instance.data.maxSize });
			} catch (ex) {
				// eslint-disable-next-line no-console
				console.info(
					`Some browsers do not support this. It is okay to use the original. Errormessage: ${ex}`,
				);
				rezisedFile = file;
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

				instance.state.set('copyRights', false);
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

	instance.onUpload = () => {
		const droppedFile = instance.droppedFile.get();
		if (!droppedFile) {
			throw new Error(`Unexpected undefined: file`);
		}

		instance.state.set('progress', 'uploading');

		instance.data.onUpload(droppedFile);

		instance.droppedFile.set(undefined);
		instance.state.set('preview', undefined);
		instance.state.set('progress', 'display');
	};

	instance.onDelete = () => {
		if (instance.data.onDelete) {
			instance.data.onDelete();
		}
		instance.droppedFile.set(undefined);
		instance.state.set('preview', undefined);
		instance.state.set('progress', 'display');
	};

	instance.onCancel = () => {
		instance.droppedFile.set(undefined);
		instance.state.set('preview', undefined);
		instance.state.set('progress', 'display');
	};
});

template.helpers({
	thumbnailAttributes() {
		const { data } = Template.instance();

		if (!data.thumbnail?.maxSize) {
			return {};
		}

		return {
			style: `max-width: ${data.thumbnail.maxSize}px; max-height: ${data.thumbnail.maxSize}px`,
		};
	},
	uploadButtonAttributes() {
		const instance = Template.instance();

		const attributes: Record<string, any> = {
			onClick: instance.onUpload,
		};

		if (!instance.state.get('copyRights')) {
			attributes.disabled = 'disabled';
		}

		return attributes;
	},
	fileName() {
		return Template.instance().droppedFile.get()?.name;
	},
	deleteAllowed() {
		return !!Template.instance().data.onDelete;
	},
	copyRightsChecked() {
		return Template.instance().state.get('copyRights') ? 'checked' : '';
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

	'change .js-check-copy-rights'(_event, instance) {
		instance.state.set('copyRights', instance.$('.js-check-copy-rights').prop('checked'));
	},
});
