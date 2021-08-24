import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './template.html';
import './styles.scss';

// feature detection for drag&drop upload
const allowsAdvancedUpload = (function () {
	const div = document.createElement('div');
	return (
		('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
		'FormData' in window &&
		'FileReader' in window
	);
})();

const Template = TemplateAny as TemplateStaticTyped<
	{},
	'fileUpload',
	{
		state: ReactiveDict<{
			isAdvancedUpload: boolean;
			isDragover: boolean;
			droppedFile: File;
		}>;
	}
>;

const template = Template.fileUpload;

template.onCreated(function () {
	const instance = this;

	instance.state = new ReactiveDict();
	instance.state.setDefault({ isAdvancedUpload: allowsAdvancedUpload, isDragover: false });
});

template.helpers({});

template.events({
	'change input[type="file"]'(event, instance) {
		instance.state.set('droppedFile', (event.target as any).files[0]);

		// automatically submit the form on file select
		instance.$('form').trigger('submit');
	},

	'drop form'(event, instance) {
		instance.state.set(
			'droppedFile',
			((event as any).originalEvent.dataTransfer as DataTransfer).files[0],
		);

		instance.$('form').trigger('submit');
	},

	'submit form'(event, instance) {
		const file = instance.state.get('droppedFile');
		if (!file) {
			throw new Error('Unexpected: None file selected');
		}

		const form = event.currentTarget as HTMLFormElement;

		// ajax file upload for modern browsers
		event.preventDefault();

		// gathering the form data
		const ajaxData = new FormData(form);
		ajaxData.append('file', file);

		// ajax request
		const ajax = new XMLHttpRequest();
		ajax.open('post', 'upload', true);

		ajax.onload = function () {
			form.classList.remove('is-uploading');
			if (ajax.status >= 200 && ajax.status < 400) {
				const data = JSON.parse(ajax.responseText);
				form.classList.add(data.success === true ? 'is-success' : 'is-error');
			//	if (!data.success) errorMsg.textContent = data.error;
			} else alert('Error. Please, contact the webmaster!');
		};

		ajax.onerror = function () {
			form.classList.remove('is-uploading');
			alert('Error. Please, try again!');
		};

		ajax.send(ajaxData);

		return true;
	},

	'click box__restart'(event, instance) {
		// restart the form if has a state of error/success
		event.preventDefault();
		(event?.currentTarget as HTMLElement).classList.remove('is-error', 'is-success');
		instance.$('input[type="file"]').trigger('click');
	},

	'drag/dragstart/dragend/dragover/dragenter/dragleave/drop form'(event) {
		// preventing the unwanted behaviours
		event.preventDefault();
		event.stopPropagation();
	},
	'dragover/dragenter form'(_event, instance) {
		instance.state.set('isDragover', true);
	},
	'dragleave/dragend/drop form'(_event, instance) {
		instance.state.set('isDragover', false);
	},
});

// const label = instance.querySelector('label');
// if (!label) {
// 	throw new Error('Label does not exists');
// }

// const errorMsg = instance.querySelector('.box__error span');
// if (!errorMsg) {
// 	throw new Error('.box__error span does not exists');
// }
// const restart = instance.querySelectorAll('.box__restart');
// let droppedFiles: FileList;

// // drag&drop files if the feature is available
// if (isAdvancedUpload) {
// 	instance.classList.add('has-advanced-upload'); // letting the CSS part to know drag&drop is supported by the browser

// 	['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(
// 		function (event) {
// 			instance.addEventListener(event, function (e) {
// 				// preventing the unwanted behaviours
// 				e.preventDefault();
// 				e.stopPropagation();
// 			});
// 		},
// 	);
// 	['dragover', 'dragenter'].forEach(function (event) {
// 		instance.addEventListener(event, function () {
// 			instance.classList.add('is-dragover');
// 		});
// 	});
// 	['dragleave', 'dragend', 'drop'].forEach(function (event) {
// 		instance.addEventListener(event, function () {
// 			instance.classList.remove('is-dragover');
// 		});
// 	});

// }

// }
