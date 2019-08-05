import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// import { L } from 'meteor/bevanhunt:leaflet';

import './map.html';

/* Display markers on an interactive map
 *
 * Expected data
 * markers: A cursor of geojson documents
 *
 * */

// eslint-disable-next-line func-names
Template.map.onCreated(function () {
	this.fullscreen = new ReactiveVar(false);
});

const FaIcon = function (faClass) {
	// eslint-disable-next-line func-names
	return function () {
		return L.DomUtil.create('span', `fa fa-${faClass}`);
	};
};

const FaCompIcon = function (opClass, icClass) {
	// eslint-disable-next-line func-names
	return function () {
		const cont = L.DomUtil.create('span', 'fa');
		L.DomUtil.create('i', `fa fa-${opClass}`, cont);

		const ic = L.DomUtil.create('i', `fa fa-lg fa-${icClass}`, cont);
		ic.style.position = 'absolute';
		ic.style.left = '0.7ex';
		L.DomUtil.setOpacity(ic, 0.5);

		return cont;
	};
};

const OpenkiControl = L.Control.extend({
	options: {
		icon: null,
		action: '',
		title: '',
		position: 'topright',
	},

	initialize(options) {
		L.Util.setOptions(this, options);
	},

	onAdd() {
		const elem = this.options.icon();
		L.DomUtil.addClass(elem, this.options.action);
		elem.setAttribute('title', this.options.title);
		return elem;
	},
});

// eslint-disable-next-line func-names
Template.map.onRendered(function () {
	const instance = this;

	const layers = {};
	const centers = {};

	L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

	const options = {
		zoomControl: false,
		attributionControl: false,
	};

	const map = L.map(instance.find('.map'), options).setView(L.latLng(0, 0), 1);


	// Add tiles depending on language
	let tiles = null;
	const tileLayers = {
		// unfortunately for 'de' the tile.openstreetmap.de server does not support SSL
		fr() {
			return L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			});
		},
		default() {
			return L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			});
		},
	};

	instance.autorun(() => {
		if (tiles) map.removeLayer(tiles);
		let tileF = tileLayers[Session.get('locale')];
		if (!tileF) tileF = tileLayers.default;
		tiles = tileF();
		tiles.addTo(map);
	});


	// Depending on view state, different controls are shown
	const zoomControl = L.control.zoom({
		zoomInTitle: mf('map.zoomInTitle', 'zoom in'),
		zoomOutTitle: mf('map.zoomOutTitle', 'zoom out'),
	});
	const attributionControl = L.control.attribution();
	const scaleControl = L.control.scale({
		imperial: Session.equals('locale', 'en'),
	});
	const fullscreenControl = new OpenkiControl({
		icon: FaIcon('arrows-alt'),
		action: 'js-make-fullscreen',
		title: mf('map.fullscreen', 'big map'),
	});
	const closeFullscreenControl = new OpenkiControl({
		icon: FaIcon('close'),
		action: 'js-close-fullscreen',
		title: mf('map.fullscreenClose', 'close'),
	});
	const addMarkerControl = new OpenkiControl({
		icon: FaCompIcon('plus', 'map-marker'),
		action: 'js-add-marker',
		title: mf('map.addMarker', 'set marker'),
	});
	const removeMarkerControl = new OpenkiControl({
		icon: FaCompIcon('minus', 'map-marker'),
		action: 'js-remove-marker',
		title: mf('map.removeMarker', 'remove the marker'),
	});

	instance.autorun(() => {
		const fullscreen = instance.fullscreen.get();
		const { mini } = instance.data;

		const show = function (control, toggle) {
			// eslint-disable-next-line no-param-reassign
			toggle = !!toggle; // coerce to bool

			// eslint-disable-next-line no-param-reassign
			if (control.shown === undefined) control.shown = false;

			if (control.shown !== toggle) {
				// eslint-disable-next-line no-param-reassign
				control.shown = toggle;
				if (toggle) {
					map.addControl(control);
				} else {
					map.removeControl(control);
				}
			}
		};

		show(attributionControl, fullscreen || !mini);
		show(zoomControl, !mini);
		show(scaleControl, fullscreen);
		show(fullscreenControl, !mini && !fullscreen);
		show(closeFullscreenControl, fullscreen);

		// This is actually a function we can call to establish a reactive
		// dependeny into the other instance.
		const { allowPlacing } = instance.data;
		show(addMarkerControl, allowPlacing && allowPlacing());

		const { allowRemoving } = instance.data;
		show(removeMarkerControl, allowRemoving && allowRemoving());
	});

	const geojsonProposedMarkerOptions = {
		radius: 8,
		fillColor: '#12f',
		color: '#222',
		weight: 1,
		opacity: 0.9,
		fillOpacity: 0.4,
	};

	// Zoom to show all markers
	// This is debounc'd so it's only done after the last marker in a series is added
	const fitBounds = _.debounce(() => {
		const bounds = L.latLngBounds([]);
		let count = 0;
		Object.keys(layers).forEach((layerPos) => {
			bounds.extend(layers[layerPos].getBounds());
			count += 1;
		});

		let maxZoom = 16;

		// Use center markers when there are no other markers
		if (count < 1) {
			Object.keys(centers).forEach((centerPos) => {
				bounds.extend(centers[centerPos]);
				count += 1;
			});
			if (count === 1) maxZoom = 13;
		}

		if (bounds.isValid()) {
			map.fitBounds(bounds, { padding: [20, 20], maxZoom });
		}
	}, 100);

	fitBounds();

	// This must be one of the ugliest pieces of code I've written ever
	const mainIcon = L.divIcon({
		html: '<span class="fa fa-map-marker" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
	});

	// Tracked so that observe() will be stopped when the template is destroyed
	Tracker.autorun(() => {
		const { markers } = instance.data;

		const addMarker = function (mark) {
			// Marks that have the center flage set are not displayed but used for anchoring the map
			if (mark.center) {
				centers[mark._id] = L.geoJson(mark.loc).getBounds();
			} else {
				const marker = L.geoJson(mark.loc, {
					pointToLayer(feature, latlng) {
						// eslint-disable-next-line no-shadow
						let marker;
						if (mark.proposed) {
							marker = L.circleMarker(latlng, geojsonProposedMarkerOptions);
						} else {
							marker = L.marker(latlng, {
								icon: mainIcon,
								draggable: mark.draggable,
							});
						}
						// When the marker is clicked, mark it as 'selected' in the collection,
						// and deselect all others.
						marker.on('click', () => {
							markers.update({}, { $set: { selected: false } });
							markers.update(mark._id, { $set: { selected: true } });
						});
						marker.on('dragend', (event) => {
							// eslint-disable-next-line no-shadow
							const marker = event.target;
							const latLng = marker.getLatLng();
							const loc = {
								type: 'Point',
								coordinates: [latLng.lng, latLng.lat],
							};
							map.panTo(latLng);
							markers.update(mark._id, { $set: { loc } });
						});
						marker.on('mouseover', () => {
							markers.update({}, { $set: { hover: false } }, { multi: true });
							markers.update(mark._id, { $set: { hover: true } });
						});
						marker.on('mouseout', () => {
							markers.update({}, { $set: { hover: false } }, { multi: true });
						});
						return marker;
					},
				});
				layers[mark._id] = marker;
				marker.addTo(map);
			}
		};

		const removeMarker = function (mark) {
			if (layers[mark._id]) map.removeLayer(layers[mark._id]);
			delete layers[mark._id];
			delete centers[mark._id];
		};

		const updateMarker = function (mark) {
			const layer = layers[mark._id];
			if (!layer) return;
			layer.setStyle({ weight: mark.hover ? 5 : 1 });
		};

		markers.find().observe({
			added(mark) {
				addMarker(mark);
				fitBounds();
			},

			changed(mark) {
				updateMarker(mark);
			},

			removed(mark) {
				removeMarker(mark);
				fitBounds();
			},
		});
	});

	Tracker.autorun(() => {
		instance.fullscreen.get();
		window.setTimeout(() => {
			map.invalidateSize();
			fitBounds();
		}, 0);
	});

	// eslint-disable-next-line func-names
	instance.proposeMarker = function () {
		const center = map.getCenter();
		instance.data.markers.insert({
			proposed: true,
			selected: true,
			loc: { type: 'Point', coordinates: [center.lng, center.lat] },
		});
	};

	// eslint-disable-next-line func-names
	instance.removeMarker = function () {
		instance.data.markers.update(
			{ main: true },
			{ $set: { remove: true } },
		);
	};
});

Template.map.helpers({
	mapContainerClass() {
		if (Template.instance().fullscreen.get()) {
			return 'map-fullscreen';
		}
		return 'map-box';
	},

	mapStyleInner() {
		const style = [];
		if (Template.instance().fullscreen.get()) {
			style.push('z-index: 9999');
		}
		return style.join(';');
	},

	fullscreen() {
		return Template.instance().fullscreen.get();
	},

	fullscreenControl() {
		const instance = Template.instance();
		return !instance.data.mini && !Template.instance().fullscreen.get();
	},
});


Template.map.events({
	click(event, instance) {
		if (instance.data.mini) instance.fullscreen.set(true);
	},

	'mousedown .js-add-marker'(event, instance) {
		instance.proposeMarker();
	},

	'click .js-remove-marker'(event, instance) {
		instance.removeMarker();
	},

	'click .js-make-fullscreen'(event, instance) {
		instance.fullscreen.set(true);
	},

	'click .js-close-fullscreen'(event, instance) {
		instance.fullscreen.set(false);
	},

	keyup(event, instance) {
		// Press escape to close fullscreen
		if (event.keyCode === 27) instance.fullscreen.set(false);
	},
});
